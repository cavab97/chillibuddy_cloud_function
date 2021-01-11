import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { checkInTicket as object } from "../../z-tools/system/objectsConfig";
import { user as directObject } from "../../z-tools/marslab-library-cloud-function/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "checkInTicket";
const directObjectName = "user";
const event = "Create";
let objectId = null;

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
      objectName: "user",
      objectIds: directObjectIds,
    });

    const readCheckIn = objectDataServices.read({
      objectName: "checkInTicket",
      objectIds: subjectIds,
    });

    const [users, checkInTicket] = await Promise.all([readUsers, readCheckIn]);

    const user = users[0];
    let checkInTicket = checkInTicket[0];

    //Object verification
    if (user === null) {
      backendServices.data.objectNotExist({ message: "User not exist." });
    }

    if (checkInTicket.numberCheckIn >= maximumCheckIn) {
      backendServices.data.objectExhausted({
        message: "Check In number had exceed monthly maximum value.",
      });
    }

    //Data Correction
    checkInTicket = { ...checkInTicket };
    data = { ...data, user, checkIns: [checkInTicket], userIds: [uid] };

    //Data Processing
    const objectData = object.attributes(data);

    //Output
    const result = await objectDataServices.create({
      objectName,
      objectId: checkInTicket.year + checkInTicket.month + uid,
      objectData,
      createdByUid: uid,
    });

    objectId = result.objectId;

    return httpUtils.successResponse({
      objectName,
      ids: [objectId],
      action: event,
      message: `Created ${objectName} successfully.`,
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
