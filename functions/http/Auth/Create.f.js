import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import * as authServices from "../../z-tools/marslab-library-cloud-function/services/auth";
import { user as object } from "../../z-tools/marslab-library-cloud-function/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "user";
const event = "Create";
let objectId = null;
let uid = null;

export default functions.https.onCall(async (data, context) => {
  try {
    //Validate Permission
    uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid, role: "admin" });
    console.log(uid)

    //Data Correction
    data = {
      ...data,
    };

    //Validate Data
    const referenceData = object.attributes({});
    backendServices.data.validation({
      target: data,
      reference: referenceData.userReceivableState,
    });

    //Data Processing
    const objectData = object.attributes(data);

    //Output
    const { email, password } = data;

    //Auth
    const createAuth = await authServices
      .createUser({
        email,
        password
      })
      .catch((error) => {
        backendServices.data.invalidArgument({ message: error.errorInfo.message });
      });
    //console.log("objectId: " + typeof uid);
    //Database
  /*   const updateDatabase = await objectDataServices.create({
      objectName,
      objectId: uid,
      objectData,
      updatedByUid: uid,
    }); */

    await Promise.all([createAuth]);

    return httpUtils.successResponse({
      objectName,
      ids: [uid],
      action: event,
      message: `Create ${objectName} successfully.`,
    });
  } catch (error) {
    let { code, message } = error;

    if (error.errorInfo) {
      code = error.errorInfo.code;
      message = error.errorInfo.message;
    }

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
