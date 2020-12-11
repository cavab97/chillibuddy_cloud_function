import * as functions from "firebase-functions";
import { bookmark as object } from "../../../z-tools/system/objectsConfig";
import { dataServices as objectDataServices } from "../../../z-tools/marslab-library-cloud-function/services/database";

const objectName = "bookmark";

export default functions
  .region("asia-east2")
  .firestore.document(`${objectName}Private0/{id}`)
  .onUpdate((snap, context) => {
    try {
      const objectId = context.params.id;
      const objectBeforeData = snap.before.data();
      let objectAfterData = snap.after.data();
      console.log("objectBefore: " + objectBeforeData);
      console.log("objectAfter: " + objectAfterData);
      //data correction
      objectAfterData = { ...objectAfterData.d, ...objectAfterData };

      const objectAttributes = object.attributes(objectAfterData);

      const fanOutTargetObjectNames = object.fanOut();
      console.log(
        "fanouttorelation: " +
          objectDataServices.fanOutToRelation({
            objectName,
            objectId,
            objectBeforeData,
            objectAfterData,
            objectAttributes,
            fanOutTargetObjectNames,
          })
      );
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
