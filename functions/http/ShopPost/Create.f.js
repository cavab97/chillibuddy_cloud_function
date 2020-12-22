import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { shopPost as object, shop as subject } from "../../z-tools/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "shopPost";
const subjectName = "shop";
const event = "Create";
let objectId = null;

export default functions.https.onCall(async (data, context) => {
  console.log("create");
  try {
    //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid, role: "admin" });

    //Validate Data
    const referenceData = object.attributes({});
    backendServices.data.validation({
      target: data,
      reference: referenceData.receivableState,
    });

    const subjectIds = data.shopIds;

    if (subjectIds.length === 0) {
      backendServices.data.objectNotExist({ message: "Shop id required." });
    }

    //Read other object
    const readShops = objectDataServices.read({
      objectName: "shop",
      objectIds: subjectIds,
    });

    const readPromise = await Promise.all([readShops]);

    const shop = readPromise[0][0];

    if (shop === null) {
      backendServices.data.objectNotExist({ message: "Shop not exist." });
    }

    //validate
    // if(data.endTime < objectDataServices.Time.now()){
    //   backendServices.data.unavailable({
    //     message: `End time cannot before current time.`,
    //   });
    // }

    //Data Correction
    data = { ...data, shop: { ...shop.d, ...shop } };
    delete data.shop["d"];

    //Data Processing
    const objectData = object.attributes(data);

    //Output
    const result = await objectDataServices.create({
      objectName,
      objectData,
      createdByUid: uid,
    });

    objectId = result.objectId;

    const objectIds = [objectId];
    const subjectObjectRelation = subject.relation.shop.create.shopPost.asChild({
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
      message: `Created ${objectName} successfully.`,
    });
  } catch (error) {
    const { code, message } = error;

    console.log(error);

    httpUtils.failedResponse({
      code: code,
      objectName,
      ids: [objectId],
      action: event,
      message: message,
    });
    return error;
  }
});
