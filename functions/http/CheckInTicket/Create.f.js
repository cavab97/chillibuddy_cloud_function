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

const days = 21;
const maximumCheckIn = 30;

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

    const subjectIds = data;

    const directObjectIds = [uid];

    //Read other object
    const readUsers = objectDataServices.read({
      objectName: directObjectName,
      objectIds: directObjectIds,
    });

    const readCheckIn = objectDataServices.db
      .collection(`${objectName}Packaging0/`)
      .where("userIds", "array-contains", directObjectIds)
      .where("status", "==", true)
      .get()

    const readPromise = await Promise.all([readUsers, readCheckIn]);

    const user = readPromise[0]
    let checkInTicket = readPromise[1]

    const resetDate = new Date();
    resetDate.setDate(resetDate.getDate() + maximumCheckIn);
    
    //Object verification
    if (user === null) {
      backendServices.data.objectNotExist({ message: "User not exist." });
    }

    /* if (checkInTicket[0] !== undefined) {
      backendServices.data.objectExist({ message: "Check In Ticket exist." });
    }
 */

    let checkInRecord = [];

    checkInRecord.push({ date: new Date(), claim: false})

    //Data Correction
    data = { 
      ...data, 
      user, 
      userIds: directObjectIds,
      status: true,
      lastCheckedIn: new Date(),
      checkInRecord: checkInRecord,
      resetDate: resetDate
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
