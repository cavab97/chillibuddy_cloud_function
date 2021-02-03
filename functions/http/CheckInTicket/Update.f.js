import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { checkInTicket as object, voucher as subject } from "../../z-tools/system/objectsConfig";
import { user as directObject } from "../../z-tools/marslab-library-cloud-function/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "checkInTicket";
const subjectName = "voucher";
const directObjectName = "user";
const event = "Update";
let objectId = null;

const days = 21;
const maximumCheckIn = 28;
const resetDay = 30;
const expiredDay = 14;

export default functions.https.onCall(async (data, context) => {
  try {
    //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid });

    //Data Correction
    data = { 
      ...data
    }

    //Validate Data
    const referenceData = object.attributes({});
    backendServices.data.validation({
      target: data,
      reference: referenceData.receivableState,
    });

    const subjectIds = [data.id];

    const directObjectIds = [uid];

    //Read other object
    const readUsers = objectDataServices.read({
      objectName: directObjectName,
      objectIds: directObjectIds,
    });

    const readCheckIn = objectDataServices.read({
      objectName: objectName,
      objectIds: [data.id]
    })

    const readPromise = await Promise.all([readUsers, readCheckIn]);

    const user = readPromise[0]
    let checkInTicket = readPromise[1]
    
    
    //Object verification
    if (user === null) {
      backendServices.data.objectNotExist({ message: "User not exist." });
    }

    if (checkInTicket === null) {
      backendServices.data.objectNotExist({ message: "Check In Ticket not found." })
    }

    if (checkInTicket[0] !== null) {

      if (checkInTicket.length > 1) {
        backendServices.data.objectNotExist({ message: "Too many active check in ticket." });
      }

      if (checkInTicket[0].numberCheckIn > maximumCheckIn) {
        backendServices.data.objectExhausted({
          message: "Check In number had exceed monthly maximum value.",
        });
      }

      //Validate date
      if (objectDataServices.Time.now().toDate().getDate() === new Date(checkInTicket[0].lastCheckedIn * 1000).getDate()) {
        backendServices.data.objectExhausted({
          message: "Check In has reached daily limit.",
        });
      } 

    }
    let status = true;

    if (checkInTicket[0].numberCheckIn >= resetDay) {
      status = false;
    }

    let checkInRecord = checkInTicket[0].checkInRecord;

    checkInRecord.push({ date: new Date(), claim: false})

    //Data Correction
    data = { 
      ...data, 
      resetDate: checkInTicket[0].resetDate,
      user, 
      userIds: directObjectIds,
      status: status,
      lastCheckedIn: new Date(),
      checkInRecord: checkInRecord,
      numberCheckIn: checkInRecord.length
    };

    //Data Processing
    const objectData = object.attributes(data);

    //Output
    const result = await objectDataServices.update({
      objectName,
      objectId: data.id,
      objectData,
      updatedByUid: uid,
    });

    objectId = result.objectId;

    let voucherInformation = null;

    //transaction
    if (checkInRecord.length === days || checkInRecord.length === maximumCheckIn) {
      return await objectDataServices.db.runTransaction(async (transaction) => {

        let type = checkInRecord.length === days ? 'standard' : 'premium'

        const readVouchers = objectDataServices.db
          .collection(`${subjectName}Private0`)
          .where("active", "==", true)
          .where("assigned", "==", false)
          .where("claimed", "==", false)
          .where("type", "==", type)
          .limit(1)
          .get()
  
        const [voucher] = await Promise.all([readVouchers]);


        if(voucher.empty){
          backendServices.data.objectNotExist({ message: "No luck please try next time." });
        }

        let voucherData = [];

        voucher.forEach((doc)=>{
          const voucherSnap = doc.data();
          voucherData.push(voucherSnap); 
        })

        const objectRef = objectDataServices.db.doc(`${objectName}Private0/${objectId}`);
        const subjectRef = objectDataServices.db.doc(`${subjectName}Private0/${voucherData[0].id}`);

        return transaction.getAll(objectRef, subjectRef ).then((docs) => {
          const objectDoc = docs[0];
          const subjectDoc = docs[1];

          const expiredDate = new Date();
          expiredDate.setDate(expiredDate.getDate() + 14);

          if (!objectDoc.exists) {
            throw Object("Object does not exist!");
          }

          if (!subjectDoc.exists) {
            throw Object("Object does not exist!");
          }

          voucherInformation = voucherData[0];
          
          transaction.update(objectRef, {
            voucherIds: [subjectDoc.id],
            voucher: { 
              ...subjectDoc.data(),
              checkInIds: [objectId],
              assigned: true,
              user: user,
              userIds: directObjectIds,
              assignedDate: {
                at: objectDataServices.Time.now(),
                by: uid
              },
              updated: {
                at: objectDataServices.Time.now(),
                by: uid
              },
              expiredDate: expiredDate
            },
            updated: {
              at: objectDataServices.Time.now(),
              by: uid
            },
            checkInRecord: checkInRecord,
            numberCheckIn: checkInRecord.length
            
          });

          transaction.update(subjectRef, {
            assigned: true,
            user: user,
            userIds: directObjectIds,
            checkInIds: [objectId],
            assignedDate: {
              at: objectDataServices.Time.now(),
              by: uid
            },
            updated: {
              at: objectDataServices.Time.now(),
              by: uid
            },
            expiredDate: expiredDate
          });

          return httpUtils.successResponse({
            objectName: "Voucher",
            ids: [voucherInformation.id],
            action: 'Received Voucher',
            message: voucherInformation,
          });

        });
      });
    } 

    return httpUtils.successResponse({
      objectName,
      ids: [objectId],
      action: event,
      message: `Updated ${objectName} successfully.`,
    });
    
  } catch (error) {
    const { code, message } = error;

    console.log(error);

    if (code)
      httpUtils.failedResponse({
        code: code,
        objectName,
        ids: [objectId],
        action: event,
        message: message,
      });

    return error;
  }
});
