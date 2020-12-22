import * as functions from "firebase-functions";
import { user } from "../../../z-tools/marslab-library-cloud-function/system/objectsConfig";
import { userDataServices } from "../../../z-tools/marslab-library-cloud-function/services/database";

const objectName = "user";

export default functions
  .region("asia-east2")
  .firestore.document(`${objectName}Private0/{${objectName}Id}`)
  .onUpdate((snap, context) => {
    console.log("fanouttorelation.f.js");

    try {
      const objectId = snap.after.id;

      const objectBeforeData = snap.before.data();
      const objectAfterData = snap.after.data();
      const objectAttributes = user.attributes(objectAfterData);

      const fanOutTargetObjectNames = user.fanOut();

      return userDataServices.fanOutToRelation({
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
