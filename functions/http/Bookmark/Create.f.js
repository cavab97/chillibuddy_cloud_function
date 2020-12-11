import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { bookmark as object, promotion as subject } from "../../z-tools/system/objectsConfig";
import { user as directObject } from "../../z-tools/marslab-library-cloud-function/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "bookmark";
const subjectName = "promotion";
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

    const subjectIds = data.promo;

    const directObjectIds = [uid];
    //Read other object
    const readUsers = objectDataServices.read({
      objectName: "user",
      objectIds: directObjectIds,
    });

    const readPromotion = objectDataServices.read({
      objectName: "promotion",
      objectIds: subjectIds,
    });

    const checkExisted = objectDataServices.readRelatedObjects({
      subjectName,
      subjectIds,
      objectName,
      directObjectName,
      directObjectIds,
    });

    const [users, promotions, RelatedObjects] = await Promise.all([
      readUsers,
      readPromotion,
      checkExisted,
    ]);

    const user = users[0];

    let promotion = promotions[0];
    const isExisted = RelatedObjects[0][0];

    //Object verification
    if (user === null) {
      backendServices.data.objectNotExist({ message: "User not exist." });
    }

    if (promotion === null) {
      backendServices.data.objectNotExist({ message: "Promotion not exist." });
    }

    // if (isExisted) {
    //   backendServices.data.objectExist({
    //     message: "The promotion is bookmarked.",
    //   });
    // }

    if (
      // !promotion.started.at ||
      objectDataServices.Time.now().seconds < promotion.d.startTime._seconds
    ) {
      backendServices.data.unavailable({
        message: "The promotion currently unavailable.",
      });
    }

    if (objectDataServices.Time.now().seconds > promotion.d.endTime._seconds) {
      backendServices.data.deadlineExceeded({
        message: "The promotion had ended.",
      });
    }

    //Data Correction
    promotion = { ...promotion.d, ...promotion };
    delete promotion["d"];
    data = { ...data, user, promotion, userIds: [uid] };

    //Data Processing
    const objectData = object.attributes(data);

    //Output
    const result = await objectDataServices.create({
      objectName,
      objectId: uid + promotion.id,
      objectData,
      createdByUid: uid,
    });

    objectId = result.objectId;

    const objectIds = [objectId];
    const subjectObjectRelation = subject.relation.promotion.create.bookmark.toUser({
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
