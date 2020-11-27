import * as functions from "firebase-functions";
import { covid19Shop as object } from "../../../z-tools/system/objectsConfig";
import { dataServices as objectDataServices } from "../../../z-tools/marslab-library-cloud-function/services/database";

const objectName = "covid19Shop"

export default functions.region("asia-east2").firestore
  .document(`${objectName}Private0/{id}`)
  .onUpdate((snap, context) => {
    try {
      const objectId = context.params.id;

      const objectBeforeData = snap.before.data();
      let objectAfterData = snap.after.data();

      //data correction
      objectAfterData = { ...objectAfterData.d, ...objectAfterData }

      const objectAttributes = object.attributes(objectAfterData)

      const fanOutTargetObjectNames = object.fanOut();

      return objectDataServices.fanOutToRelation({
        objectName,
        objectId,
        objectBeforeData,
        objectAfterData,
        objectAttributes,
        fanOutTargetObjectNames
      });
      
    } catch (error) {
      return console.error(error);
    }
  });


