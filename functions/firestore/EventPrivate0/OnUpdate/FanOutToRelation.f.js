import * as functions from "firebase-functions";
import { event as object } from "../../../z-tools/system/objectsConfig";
import { dataServices as objectDataServices } from "../../../z-tools/marslab-library-cloud-function/services/database";

const objectName = "event";

export default functions
  .region("asia-east2")
  .firestore.document(`${objectName}Private0/{id}`)
  .onUpdate((snap, context) => {
    console.log("eventPrivate FanOutToRelation.f.js");

    try {
      const objectId = snap.after.id;

      const objectBeforeData = snap.before.data();
      let objectAfterData = snap.after.data();

      //data correction
      objectAfterData = { ...objectAfterData };

      const objectAttributes = object.attributes(objectAfterData);

      const fanOutTargetObjectNames = object.fanOut();

      return objectDataServices.fanOutToRelation({
        objectName,
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
