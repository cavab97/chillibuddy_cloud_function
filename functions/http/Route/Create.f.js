import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { route as object, routeGroup as subject} from "../../z-tools/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";
 
const objectName = "route";
const subjectName = "routeGroup";
const event = "Create";
let objectId = null;

export default functions.https.onCall(async (data, context) => {
  try {
    //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid, role: "admin" });
    const subjectIds = data.routeGroupId
    
    //Data Correction
    data = { 
      ...data,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime)
    }
    
    //Validate Data
    const referenceData = object.attributes({});
    backendServices.data.validation({
      target: data,
      reference: referenceData.receivableState
    });

    //Data Processing
    const objectData = object.attributes(data);

    //Output
    const result = await objectDataServices.create({
      objectName,
      objectData,
      createdByUid: uid
    });

    objectId = result.objectId

    const objectIds = [objectId]
    const subjectObjectRelation = subject.relation.routeGroup.create.route.asChild({
      subjectName,
      subjectIds
    });

    await objectDataServices.createRelation({
      subjectName,
      subjectIds,
      objectName,
      objectIds,
      subjectObjectRelation
    });

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
