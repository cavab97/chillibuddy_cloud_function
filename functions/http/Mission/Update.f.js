import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { mission as object } from "../../z-tools/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "mission";
const event = "Update";
let objectId = null;

export default functions.https.onCall(async (data, context) => {
  console.log("update");

  try {
    //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid, role: "admin" });

    //Data Correction
    data = { ...data };

    //Validate Data
    const referenceData = object.attributes({});
    backendServices.data.validation({
      target: data,
      reference: referenceData.receivableState,
    });

    //Data Processing
    const objectData = object.attributes(data).manualUpdatableState;

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
      message: `Update ${objectName} successfully.`,
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
