import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";
import { reward as object, route, event } from "../../z-tools/system/objectsConfig";

const objectName = "reward";
const eventAction = "Delete";
let objectId = null;
let subject = {};
let subjectName = null;
let subjectIds = [];

export default functions.https.onCall(async (data, context) => {
  console.log("delete");
  try {
    //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid, role: "admin" });

    if (data.routeIds.length !== 0) {
      subject = route;
      subjectName = "route";
      subjectIds = data.routeIds;
    } else {
      subject = event;
      subjectName = "event";
      subjectIds = data.eventIds;
    }

    //Read other object
    const subjectData = await objectDataServices.read({
      objectName: subjectName,
      objectIds: subjectIds,
      dataCategory: "Private0",
    });

    if (subjectData[0].published.boolean) {
      backendServices.data.unavailable({
        message: `Can't delete reward after the ${subjectName} published.`,
      });
    }

    //Output
    const result = await objectDataServices.remove({
      objectName,
      objectId: data.id,
      deletedByUid: uid,
    });

    objectId = result.objectId;

    return httpUtils.successResponse({
      objectName,
      ids: [objectId],
      action: eventAction,
      message: `Delete ${objectName} successfully.`,
    });
  } catch (error) {
    const { code, message } = error;

    console.log(error);

    httpUtils.failedResponse({
      code: code,
      objectName,
      ids: [objectId],
      action: eventAction,
      message: message,
    });
    return error;
  }
});
