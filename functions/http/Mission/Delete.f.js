import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "mission";
const subjectName = "route";
const event = "Delete";
let objectId = null;

export default functions.https.onCall(async (data, context) => {
  try {
    //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid, role: "admin" });

    const subjectIds = data.routeIds;
    
    //Read other object
    const subjectData = await objectDataServices.read({
      objectName: subjectName,
      objectIds: subjectIds,
      dataCategory: "Private0",
    });

    //Validate
    if(subjectData[0].published.boolean){
      backendServices.data.unavailable({
        message: `Can't delete mission after the ${subjectName} published.`,
      });
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
