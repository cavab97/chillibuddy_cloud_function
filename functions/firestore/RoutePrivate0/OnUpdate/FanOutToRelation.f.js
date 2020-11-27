import * as functions from "firebase-functions";
import { route as object } from "../../../z-tools/system/objectsConfig";
import { dataServices as objectDataServices } from "../../../z-tools/marslab-library-cloud-function/services/database";

const objectName = "route"

export default functions.region("asia-east2").firestore
  .document(`${objectName}Private0/{id}`)
  .onUpdate(async(snap, context) => {
    try {
      const objectId = snap.after.id;
      const { id } = context.params;
      
      //check is this fanout are lastest
      //const route = await objectDataServices.db.doc(`${objectName}Private0/${id}`).get()
      //if( snap.after.updateTime.nanoseconds < route.updateTime.nanoseconds ){
      //  return console.log("Skipped fan out due to expired data.")
      //}

      const objectBeforeData = snap.before.data();
      let objectAfterData = snap.after.data();

      //data correction
      objectAfterData = { ...objectAfterData }

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


