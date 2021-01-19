import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { merchant as object } from "../../z-tools/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "merchant";
const subjectName = "user";
const event = "Create";
let objectId = null;

export default functions.https.onCall(async (data, context) => {
  try {
    //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid, role: "admin" });

    //Data Correction
    data = { 
      ...data
    }

    //Validate Data
    const referenceData = object.attributes({});
    backendServices.data.validation({
      target: data,
      reference: referenceData.receivableState
    });

    const subjectIds = data.superadmin;

    if(subjectIds.length === 0)
    {
      backendServices.data.objectNotExist({
        message:"User id required."
      })
    }

    //Read other object
    const readUsers = objectDataServices.read({ 
      objectName: subjectName, 
      objectIds: subjectIds
    });

    const readUserExisted = objectDataServices.db
      .collection(`${objectName}Packaging0/`)
      .where("superadmin", "array-contains-any", subjectIds)
      .get()

    const readPromise = await Promise.all([readUsers, readUserExisted])

    const user = readPromise[0];
    const userSnapshot = readPromise[1];

    //validate
    if(user === null) {
      backendServices.data.objectNotExist({
        message:"User does not exist."
      })
    }

    if(!userSnapshot.empty) {
      backendServices.data.objectNotExist({
        message:"User is already a superadmin for another merchant."
      })
    }

    if(!data.businessName){
      backendServices.data.objectNotExist({
        message: `Business name cannot be empty.`,
      });
    }

    //Data Correction
    data = { 
      ...data,
    }

    //Data Processing
    const objectData = object.attributes(data);

    //Output
    const result = await objectDataServices.create({
      objectId: data.id,
      objectName,
      objectData,
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
