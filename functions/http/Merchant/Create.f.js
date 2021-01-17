import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { merchant as object, shop as subject } from "../../z-tools/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "merchant";
const subjectName = "shop";
const directObjectName = "user";
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

    if(data.shops.length === 0)
    {
      backendServices.data.objectNotExist({
        message:"Shop id required."
      })
    }

    //Read other object
    const readUsers = objectDataServices.read({ 
      objectName: "user", 
      objectIds: subjectIds
    });

    const readShops = objectDataServices.read({
      objectName: "shop",
      objectIds: data.shops[0]
    })
    
    const readPromise = await Promise.all([readUsers, readShops])

    const user = readPromise[0][0];
    const shop = readPromise[1][0];

    if(user === null)
    {
      backendServices.data.objectNotExist({
        message:"User does not exist."
      })
    }

    if(shop === null)
    {
      backendServices.data.objectNotExist({
        message:"Shop does not exist."
      })
    }

    //validate
    if(!data.name){
      backendServices.data.unavailable({
        message: `Name cannot be empty.`,
      });
    }

    //Data Correction
    data = { 
      ...data,
      superadmin: [user.id],
      shops: [shop.id]
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

    const objectIds = [objectId];
    const subjectObjectRelation = subject.relation.shop.create.voucher.asChild({
      subjectName,
      subjectIds,
    });

    await objectDataServices.createRelation({
      subjectName,
      subjectIds,
      objectName,
      objectIds,
      subjectObjectRelation,
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
