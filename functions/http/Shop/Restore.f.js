import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { shopDataServices as objectDataServices } from "../../z-tools/services/database";
import { shop as object } from "../../z-tools/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "shop";
const event = "Restore";
let objectId = null;

export default functions.https.onCall(async (data, context) => {
  console.log("restore");
  try {
    //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid, role: "admin" });

    //Output
    const result = await objectDataServices.restore({
      objectId: data.id,
    });

    objectId = result.objectId;

    return httpUtils.successResponse({
      objectName,
      ids: [objectId],
      action: event,
      message: `Restore shop successfully.`,
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
