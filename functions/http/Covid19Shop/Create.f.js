import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { covid19Shop as object } from "../../z-tools/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";
 
const objectName = "covid19Shop";
const subjectName = "user";
const event = "Create";
let objectId = null;

export default functions.https.onCall(async (data, context) => {
  try {
    // //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid, role: "user" });

    //Data Correction
    data = { 
      ...data,
    }

    //Validate Data
    const referenceData = object.attributes({});
    backendServices.data.validation({
      target: data,
      reference: referenceData.receivableState
    });

    const subjectIds = data.userIds;

    //Read other object
    const readSubject = await objectDataServices.read({
      objectName: subjectName,
      objectIds: subjectIds,
      dataCategory: "Private0",
    });

    const user = readSubject[0];

    if(!user){
      backendServices.data.objectNotExist({message:"User not exist."})
    }

    data = {
      ...data,
      user: user
    }

    //Data Processing
    const objectData = object.attributes(data);

    //Output
    const result = await objectDataServices.create({
      objectName,
      objectData,
      objectId: user.id,
      createdByUid: uid
    });

    objectId = result.objectId

    return httpUtils.successResponse({
      objectName,
      ids: [objectId],
      action: event,
      message: `Created ${objectName} successfully.`
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
