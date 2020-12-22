import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { route as object } from "../../z-tools/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "route";
const event = "AssignCompleted";
let objectId = null;

export default functions.https.onCall(async (data, context) => {
  console.log("assign completed");
  try {
    //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid, role: "admin" });

    //read other object
    const routes = await objectDataServices.read({ objectName, objectIds: [data.id] });
    const route = routes[0];

    if (!route.ended.by) {
      backendServices.data.objectExist({ message: "Can't assign complete before route end." });
    }

    if (route.assignCompleted) {
      backendServices.data.objectExist({ message: "This route has been assign completed before." });
    }

    const assignCompleted = { assignCompleted: true };

    //Data Processing
    const objectData = object.attributes(assignCompleted).assignCompleteObjectState;

    //Output
    const result = await objectDataServices.update({
      objectName,
      objectId: data.id,
      objectData,
      updatedByUid: uid,
    });

    objectId = result.objectId;

    return httpUtils.successResponse({
      objectName,
      ids: [objectId],
      action: event,
      message: `Complete assign ${objectName} successfully.`,
    });
  } catch (error) {
    const { code, message } = error;

    console.log(error);

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
