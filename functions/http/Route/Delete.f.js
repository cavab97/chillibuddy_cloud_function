import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "route";
const event = "Delete";
let objectId = null;

export default functions.https.onCall(async (data, context) => {
  try {
    //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid, role: "admin" });

    //read other object
    const routes = await objectDataServices.read({objectName, objectIds: [data.id]})
    const route = routes[0]


    if(route.terminated.by === null && route.published.by !== null){
      backendServices.data.invalidArgument({message:"route cannot be delete before terminate."})
    }

    //Output
    const result = await objectDataServices.remove({
      objectName,
      objectId: data.id,
      deletedByUid: uid
    });

    objectId = result.objectId

    return httpUtils.successResponse({
      objectName,
      ids: [objectId],
      action: event,
      message: `Delete ${objectName} successfully.`
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
