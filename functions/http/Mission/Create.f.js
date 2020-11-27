import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { mission as object, route as subject } from "../../z-tools/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "mission";
const subjectName = "route";
const directObjectName = "shop"
const event = "Create";
let objectId = null;

export default functions.https.onCall(async (data, context) => {
  try {
    //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid, role: "admin" });

    //Validate Data
    const referenceData = object.attributes({});
    backendServices.data.validation({
      target: data,
      reference: referenceData.receivableState
    });

    const subjectIds = data.routeIds;

    const directObjectIds = data.shopIds;

    if(directObjectIds.length === 0)
    {
      backendServices.data.objectNotExist({message:"Shop id required."})
    }

    if(subjectIds.length === 0)
    {
      backendServices.data.objectNotExist({message:"Route id required."})
    }

    //Read other object
    const readShops = objectDataServices.read({ 
      objectName:"shop", 
      objectIds: directObjectIds 
    });
    
    const readSubject = objectDataServices.read({
      objectName: subjectName,
      objectIds: subjectIds,
      dataCategory: "Packaging0",
    });
    
    const readPromise = await Promise.all([readShops, readSubject])

    const shop = readPromise[0][0];
    const route = readPromise[1][0];

    if(shop === null)
    {
      backendServices.data.objectNotExist({message:"Shop not exist."})
    }

    //validate
    if(route.published.boolean){
      backendServices.data.unavailable({
        message: `Can't add new mission after the ${subjectName} published.`,
      });
    }

    //Data Correction
    data = { ...data, shop:{...shop.d, ...shop }  }
    delete data.shop["d"]

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
    const subjectObjectRelation = subject.relation.route.create.mission.toShop({
      subjectName,
      subjectIds,
      directObjectName,
      directObjectIds
    });

    await objectDataServices.createRelation({
      subjectName,
      subjectIds,
      objectName,
      objectIds,
      directObjectName,
      directObjectIds,
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
