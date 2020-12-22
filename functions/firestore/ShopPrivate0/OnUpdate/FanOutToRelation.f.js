import * as functions from "firebase-functions";
import { shop } from "../../../z-tools/system/objectsConfig";
import { shopDataServices } from "../../../z-tools/services/database";

const objectName = "shop";

export default functions
  .region("asia-east2")
  .firestore.document(`${objectName}Private0/{id}`)
  .onUpdate((snap, context) => {
    console.log("shopPrivate fanouttorelation.f.js");

    try {
      const objectId = snap.after.id;

      const objectBeforeData = snap.before.data();
      let objectAfterData = snap.after.data();

      //data correction
      objectAfterData = { ...objectAfterData.d, ...objectAfterData };

      const objectAttributes = shop.attributes(objectAfterData);

      const fanOutTargetObjectNames = shop.fanOut();

      return shopDataServices.fanOutToRelation({
        objectId,
        objectBeforeData,
        objectAfterData,
        objectAttributes,
        fanOutTargetObjectNames,
      });
    } catch (error) {
      return console.error(error);
    }
  });
