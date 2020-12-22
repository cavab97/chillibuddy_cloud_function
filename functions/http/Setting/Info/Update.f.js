import * as functions from "firebase-functions";
import * as backendServices from "../../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../../z-tools/marslab-library-cloud-function/services/database";
import { settingInfo as object } from "../../../z-tools/system/objectsConfig";

import * as httpUtils from "../../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "setting";
const objectId = "info";
const event = "Update";

export default functions.https.onCall(async (data, context) => {
  console.log("update");

  try {
    //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid, role: "admin" });

    //Data Correction
    data = {
      ...data,
    };

    //Validate Data
    const referenceData = object.attributes({});
    backendServices.data.validation({
      target: data,
      reference: referenceData.receivableState,
    });

    //Data Processing
    const objectData = object.attributes(data);

    //Output
    const result = await objectDataServices.create({
      objectName,
      objectId,
      objectData,
      createdByUid: uid,
    });

    return httpUtils.successResponse({
      objectName,
      ids: [objectId],
      action: event,
      message: `Updated system info successfully.`,
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
