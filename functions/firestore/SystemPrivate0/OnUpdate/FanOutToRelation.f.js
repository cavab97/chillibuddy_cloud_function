import * as functions from "firebase-functions";
import { system } from "../../../z-tools/marslab-library-cloud-function/system/objectsConfig";
import { systemDataServices } from "../../../z-tools/marslab-library-cloud-function/services/database";

const objectName = "system"

export default functions.region("asia-east2").firestore
  .document(`${objectName}Private0/{${objectName}Id}`)
  .onUpdate((snap, context) => {
    try {
      const objectId = snap.after.id;

      const objectBeforeData = snap.before.data();
      const objectAfterData = snap.after.data();
      const objectAttributes = system.attributes(objectAfterData)

      const fanOutTargetObjectNames = system.fanOut();

      return systemDataServices.fanOutToRelation({
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


