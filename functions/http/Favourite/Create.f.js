import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { favourite as object, shop as subject } from "../../z-tools/system/objectsConfig";
import { user as directObject } from "../../z-tools/marslab-library-cloud-function/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "favourite";
const subjectName = "shop";
const directObjectName = "user";
const event = "Create";
let objectId = null;

export default functions.https.onCall(async (data, context) => {
  try {
    //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid });

    //Validate Data
    const referenceData = object.attributes({});
    backendServices.data.validation({
      target: data,
      reference: referenceData.receivableState,
    });

    const subjectIds = data.shopIds;

    const directObjectIds = [uid];
    //Read other object
    const readUsers = objectDataServices.read({
      objectName: directObjectName,
      objectIds: directObjectIds,
    });

    const readShops = objectDataServices.read({
      objectName: subjectName,
      objectIds: subjectIds,
    });

    const checkExisted = objectDataServices.readRelatedObjects({
      subjectName,
      subjectIds,
      objectName,
      directObjectName,
      directObjectIds,
    });

    const [users, shops, RelatedObjects] = await Promise.all([
      readUsers,
      readShops,
      checkExisted,
    ]);

    const user = users[0];

    let shop = shops[0];
    const isExisted = RelatedObjects[0][0];

    //Object verification
    if (user === null) {
      backendServices.data.objectNotExist({ message: "User not exist." });
    }

    if (shop === null) {
      backendServices.data.objectNotExist({ message: "Shop not exist." });
    }

    //Data Correction
    shop = { ...shop.d, ...shop };
    delete shop["d"];
    data = { 
        ...data, 
        user, 
        shop, 
        userIds: [uid],
        shopIds: subjectIds
    };

    //Data Processing
    const objectData = object.attributes(data);

    //Output
    const result = await objectDataServices.create({
      objectName,
      objectId: uid + shop.id,
      objectData,
      createdByUid: uid,
    });

    objectId = result.objectId;

    const objectIds = [objectId];
    const subjectObjectRelation = subject.relation.shop.create.favourite.toUser({
      subjectName,
      subjectIds,
      directObjectName,
      directObjectIds,
    });

    await objectDataServices.createRelation({
      subjectName,
      subjectIds,
      objectName,
      objectIds,
      directObjectName,
      directObjectIds,
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

    if (code)
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
