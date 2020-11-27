import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "route";
const event = "Restore";
let objectId = null;

export default functions.https.onCall(async (data, context) => {
  try {
    //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid, role: "admin" });

    //Output
    const result = await objectDataServices.restore({
      objectName,
      objectId: data.id
    });

    objectId = result.objectId

    return httpUtils.successResponse({
      objectName,
      ids: [objectId],
      action: event,
      message: `Restore ${objectName} successfully.`
    });
  } catch (error) {
    const { code, message } = error;

    console.log(error);

    httpUtils.failedResponse({
      code: code,
      objectName,
      ids: [objectId],
      action: event,
      message: message
    });
    return error;
  }
});
