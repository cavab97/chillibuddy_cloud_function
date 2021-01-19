import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { checkInTicket as object, voucher as subject } from "../../z-tools/system/objectsConfig";
import { user as directObject } from "../../z-tools/marslab-library-cloud-function/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "checkInTicket";
const subjectName = "voucher";
const directObjectName = "user";
const event = "Create";
let objectId = null;

const days = 7;
const maximumCheckIn = 28;

export default functions.https.onCall(async (data, context) => {
  try {
    //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid });

    //Validate Data
    const referenceData = object.attributes({});
    backendServices.data.validation({
      target: data,
      reference: referenceData.receivableState,
    });

    const subjectIds = data;

    const directObjectIds = [uid];

    //Read other object
    const readUsers = objectDataServices.read({
      objectName: directObjectName,
      objectIds: directObjectIds,
    });

    const readCheckIn = objectDataServices.db
      .collection(`${objectName}Packaging0/`)
      .where("userIds", "array-contains-any", directObjectIds)
      .where("month", "==", data.month)
      .where("year", "==", data.year)
      .orderBy("created.at", "desc")
      .get()

    const [users, checkInTickets] = await Promise.all([readUsers, readCheckIn]);

    const user = users[0]
    let checkInTicket = checkInTickets[0]
    const currentDate = new Date()
    let numberOfCheckIn;
    
    //Object verification
    if (user === null) {
      backendServices.data.objectNotExist({ message: "User not exist." });
    }

    if (checkInTicket) {
      if (checkInTicket.numberCheckIn >= maximumCheckIn)
      backendServices.data.objectExhausted({
        message: "Check In number had exceed monthly maximum value.",
      });

      if (checkInTicket.createdDate.toDate() === currentDate.toDate()) {
        backendServices.data.objectExhausted({
          message: "Check In has reached daily limit.",
        });
      }

      numberOfCheckIn = checkInTicket.numberCheckIn ?  0 : checkInTicket.numberCheckIn++;
    }

    //Data Correction
    checkInTicket = { ...checkInTicket };
    data = { 
      ...data, 
      numberCheckIn: numberOfCheckIn,
      user, 
      userIds: directObjectIds 
    };

    //Data Processing
    const objectData = object.attributes(data);

    //Output
    const result = await objectDataServices.create({
      objectName,
      objectId,
      objectData,
      createdByUid: uid,
    });

    objectId = result.objectId;

    //transaction
    if (checkInTicket.numberCheckIn % days === 0) {
      return await objectDataServices.db.runTransaction(async (transaction) => {

        const readVouchers = objectDataServices.db
          .collection(`${subjectName}Packaging0/`)
          .where("active", "==", true)
          .where("assigned", "==", false)
          .where("claimed", "==", false)
          .limit(1)
          .get()
  
        const [vouchers] = await Promise.all([readVouchers]);
    
        const voucher = vouchers[0];

        const objectRef = objectDataServices.db.doc(`${objectName}Private0/${objectId}`);
        const subjectRef = objectDataServices.db.doc(`${subjectName}Private0/${voucher.id}`);

        return transaction.getAll(objectRef, subjectRef).then((docs) => {
          const objectDoc = docs[0];
          const subjectDoc = docs[1];

          if (!objectDoc.exists) {
            throw Object("Object does not exist!");
          }

          if (!subjectDoc.exists) {
            return httpUtils.successResponse({
              objectName,
              ids: [objectId],
              action: event,
              message: `No luck please try next time!`,
            });
          }
          
          transaction.update(objectRef, {
            voucherIds: subjectDoc.id,
            voucher: subjectDoc.voucher,
            ["updated.at"]: objectDataServices.Time.now(),
            ["updated.by"]: "System"
          });

          return transaction.update(subjectRef, {
            assigned: true,
            voucherIds: subjectDoc.id,
            voucher: subjectDoc.voucher,
            user: objectDoc.user,
            userIds: objectDoc.userIds,
            ["assignedDate.at"]: objectDataServices.Time.now(),
            ["updated.at"]: objectDataServices.Time.now(),
            ["updated.by"]: "System"
          });
        });
      });
    }

    return httpUtils.successResponse({
      objectName,
      ids: [objectId],
      action: event,
      message: `You have successfuly received a ${objectName}.`,
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
