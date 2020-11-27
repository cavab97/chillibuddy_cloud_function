import * as functions from "firebase-functions";
import { invitation } from "../../../z-tools/marslab-library-cloud-function/system/objectsConfig";
import { invitationDataServices } from "../../../z-tools/marslab-library-cloud-function/services/database";

const objectName = "invitation"

export default functions.region("asia-east2").firestore
  .document(`${objectName}Private0/{${objectName}Id}`)
  .onUpdate((snap, context) => {
    try {
      const objectId = snap.after.id;

      const objectBeforeData = snap.before.data();
      const objectAfterData = snap.after.data();
      const objectAttributes = invitation.attributes(objectAfterData)

      const fanOutTargetObjectNames = invitation.fanOut();

      return invitationDataServices.fanOutToRelation({
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


