import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "bookmark";
const subjectName = "promotion";
const event = "Delete";
let objectId = null;

export default functions.https.onCall(async (data, context) => {
  console.log("delete");
  try {
    //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid });

    const deleted = {
      ["d.deleted"]: {
        at: data.endTime.seconds,
        by: uid,
      },
    };

    //Output
    const result = await objectDataServices.remove({
      objectName,
      objectId: data.id,
      deletedByUid: uid,
      additionUpdate: deleted,
    });

    objectId = result.objectId;

    return httpUtils.successResponse({
      objectName,
      ids: [objectId],
      action: event,
      message: `Delete ${objectName} successfully.`,
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
