import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { event as object } from "../../z-tools/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "event";
const event = "Publish";
let objectId = null;

export default functions.https.onCall(async (data, context) => {
  try {
    //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid, role: "admin" });

    const publishData = {
      published: {
        at: objectDataServices.Time.now(),
        by: uid,
        boolean:true
      },
    };

    //Data Processing
    const objectData = object.attributes(publishData).publishObjectState;

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
      message: `Publish ${objectName} successfully.`,
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
