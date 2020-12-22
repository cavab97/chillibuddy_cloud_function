import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { promotion as object, shop as subject } from "../../z-tools/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "promotion";
const subjectName = "shop";
const event = "Create";
let objectId = null;

export default functions.https.onCall(async (data, context) => {
  try {
    //Validate Permission
    const uid = context.auth.uid;
    console.log("uid: " + uid);
    await backendServices.permission.identityChecking({ uid, role: "admin" });

    //Data Correction
    data = {
      ...data,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
    };

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
    if (data.endTime < objectDataServices.Time.now()) {
      backendServices.data.unavailable({
        message: `End time cannot before current time.`,
      });
    }

    if (data.coverPhotos.length <= 0) {
      backendServices.data.unavailable({
        message: `Cover Photo cannot be empty.`,
      });
    }

    if (data.images.length <= 0) {
      backendServices.data.unavailable({
        message: `Images cannot be empty`,
      });
    }

    //Data Correction
    data = { ...data, shop: { ...shop.d, ...shop } };
    delete data.shop["d"];

    //Data Processing
    const objectData = object.attributes(data);

    //Output
    const result = await objectDataServices.create({
      objectId: data.id,
      objectName,
      objectData,
      createdByUid: uid,
    });

    objectId = result.objectId;

    const objectIds = [objectId];
    const subjectObjectRelation = subject.relation.shop.create.promotion.asChild({
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
