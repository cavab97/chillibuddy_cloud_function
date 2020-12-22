import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { user as object } from "../../z-tools/marslab-library-cloud-function/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "user";
const event = "UnionNotisToken";
let objectId = null;
let uid = null;

export default functions.https.onCall(async (data, context) => {
  console.log("union notis token");
  try {
    //Validate Permission
    uid = context.auth.uid;

    //Data Correction
    data = {
      ...data,
    };

    console.log(data);

    //Validate Data
    const referenceData = object.attributes({});
    backendServices.data.validation({
      target: data,
      reference: referenceData.receivableState,
    });

    if (typeof data.notificationToken[0] !== "string") {
      backendServices.data.invalidArgument({ message: "The notification token invalid" });
    }

    //Data Processing
    const notificationTokenData = { notificationToken: data.notificationToken[0] };
    const objectData = object.attributes(data).notificationTokenState;

    //Output

    //Database
    const updateDatabase = await objectDataServices.update({
      objectName,
      objectId: uid,
      objectData,
      objectArrayUnionData: notificationTokenData,
      updatedByUid: uid,
    });

    return httpUtils.successResponse({
      objectName,
      ids: [uid],
      action: event,
      message: `Union notification token for ${objectName} successfully.`,
    });
  } catch (error) {
    const { code, message } = error;

    console.log(error);

    httpUtils.failedResponse({
      code: code,
      objectName,
      ids: [uid],
      action: event,
      message: message,
    });
    return error;
  }
});
