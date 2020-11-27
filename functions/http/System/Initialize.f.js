import * as functions from "firebase-functions";
import { setCustomUserClaims } from "../../z-tools/marslab-library-cloud-function/services/auth";
import { systemDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { system,user } from "../../z-tools/marslab-library-cloud-function/system/objectsConfig";
import { roleClaims } from "../../z-tools/marslab-library-cloud-function/system/customClaimsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "system";
const objectId = "management";
const objectIds = [objectId];
const event = "Initialize";

export default functions.https.onCall(async (data, context) => {
  try {
    //Validate Data
    
    //Validate Permission
    const uid = context.auth.uid;

    //Validate Status
    const [object] = await systemDataServices.readSystem({ objectIds });

    if (object) {
      throw new Object({code: httpUtils.FunctionsErrorCode.alreadyExists, message: "This system initialized before."}) 
    }

    const customClaims = roleClaims.absoluteDeveloper;

    const promises = [];


    //set Absolute Admin Permission
    promises.push(setCustomUserClaims({ uid, customClaims }));

    //Create System Object
    const objectData = system.attributes({ absoluteDeveloper: [uid] });

    await systemDataServices.create({ objectId, objectData });

    const subjectObjectRelation = user.relation.user.initialize.system({
      uid
    });

    promises.push(
      systemDataServices.createRelation({
        subjectName: "user",
        subjectIds: [uid],
        objectIds: [objectId],
        subjectObjectRelation
      })
    );

    await Promise.all(promises);

    return httpUtils.successResponse({
      objectName,
      ids: [objectId],
      action: event,
      message: `user ${uid} initial system successfully.`
    });
  } catch (error) {
    const { code, message } = error

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
