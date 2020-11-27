import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { shopDataServices as objectDataServices } from "../../z-tools/services/database";
import { dataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { shop as object } from "../../z-tools/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

import admin from "firebase-admin";

const firestore = admin.firestore;
const time = firestore.Timestamp;


const objectName = "shop";
const targetName = "promotion"
const event = "Delete";
let objectId = null;

export default functions.https.onCall(async (data, context) => {
  try {
    //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid, role: "admin" });

    const deleted = {
      ["d.deleted"]: {
        at: time.now(),
        by: uid,
      }
    }

    objectId = data.id;

    //read other object
    const targetSnapShot = await dataServices.db
      .collection(`${objectName}Packaging0/${objectId}/${targetName}Packaging0`)
      .where("d.started.boolean", "==", true)
      .where("d.ended.boolean", "==", false)
      .where("d.deleted.at", "==", null)
      .get()

    const promotionRunIds = [];
    targetSnapShot.forEach((docSnapShot) => {
      const promotionId = docSnapShot.data().id;
      promotionRunIds.push(promotionId);
    });

    if(promotionRunIds.length > 0){
      backendServices.data.invalidArgument({message:"shop cannot delete, shop's promotion are running."})
    }

    //Output
    const result = await objectDataServices.remove({
      objectId: data.id,
      deletedByUid: uid,
      additionUpdate: deleted
    });

    objectId = result.objectId

    return httpUtils.successResponse({
      objectName,
      ids: [objectId],
      action: event,
      message: `Delete shop successfully.`
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
