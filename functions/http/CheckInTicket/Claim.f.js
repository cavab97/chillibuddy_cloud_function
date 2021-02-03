import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { checkInTicket as object, voucher as subject } from "../../z-tools/system/objectsConfig";
import { user as directObject } from "../../z-tools/marslab-library-cloud-function/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "checkInTicket";
const subjectName = "voucher";
const directObjectName = "user";
const event = "Claim";
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
    if (user === undefined || user === null) {
      backendServices.data.objectNotExist({ message: "User not exist." });
    }

    if (checkInTicket === undefined || checkInTicket === null) {
      backendServices.data.objectNotExist({ message: "Check In Ticket not found." })
    }

    if (checkInTicket[0] !== null) {
      console.log("length:"+JSON.stringify(checkInTicket[0].checkInRecord.length))
      console.log("days:"+ JSON.stringify(days))
      console.log("days"+JSON.stringify(maximumCheckIn))
      if (checkInTicket[0].checkInRecord.length < days && checkInTicket[0].checkInRecord.length > days) {
        backendServices.data.objectExhausted({ message: "You cannot claim the ticket." });
      }

      if (checkInTicket[0].checkInRecord.length > maximumCheckIn && checkInTicket[0].checkInRecord.length < maximumCheckIn){
        backendServices.data.objectExhausted({ message: "You cannot claim the ticket." });
      }
    }

    let checkInRecord = checkInTicket[0].checkInRecord;

    checkInRecord[checkInRecord.length - 1] = { claim: true, date: checkInRecord[checkInRecord.length - 1].date }

    console.log("length:"+JSON.stringify(checkInRecord))
    //Data Correction
    data = { 
      ...checkInTicket[0],
      checkInRecord: checkInRecord,
    };

    //Data Processing
    const objectData = object.attributes(data);

    //Output
    const result = await objectDataServices.update({
      objectName,
      objectId: [data.id],
      objectData,
      updatedByUid: uid,
    });

    objectId = result.objectId;
  
    return httpUtils.successResponse({
      objectName,
      ids: [objectId],
      action: event,
      message: `Claimed ${subjectName} successfully.`,
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
