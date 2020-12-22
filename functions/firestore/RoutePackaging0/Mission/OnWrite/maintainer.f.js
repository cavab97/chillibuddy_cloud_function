import * as functions from "firebase-functions";
import { dataServices as objectDataServices } from "../../../../z-tools/marslab-library-cloud-function/services/database";

const objectName = "route";
const targetName = "mission";

export default functions
  .region("asia-east2")
  .firestore.document(`${objectName}Packaging0/{objectId}/${targetName}Packaging0/{targetId}`)
  .onWrite(async (snap, context) => {
    console.log("route missionMaintainer.f.js");

    try {
      const { objectId } = context.params;
      const functionEventId = context.eventId;

      return await objectDataServices.db.runTransaction((transaction) => {
        const objectRef = objectDataServices.db.doc(`${objectName}Private0/${objectId}`);
        const idempotentRef = objectDataServices.db.doc(`log/function/eventId/${functionEventId}`);

        return transaction.getAll(objectRef, idempotentRef).then((docs) => {
          const object = docs[0];
          const idempotent = docs[1];

          if (!object.exists) {
            throw Object("Object does not exist!");
          }

          if (idempotent.exists) {
            return console.log("Function trigger repeatly.");
          }
          let { totalMissions } = object.data();

          if (!snap.before.exists) {
            totalMissions = ++totalMissions;
            transaction.update(objectRef, {
              totalMissions,
            });
          }

          if (
            snap.before.exists &&
            snap.before.data().deleted.at === null &&
            snap.after.data().deleted.at
          ) {
            totalMissions = --totalMissions;
            transaction.update(objectRef, {
              totalMissions,
            });
          }

          return transaction.set(idempotentRef, {
            actived: { at: objectDataServices.Time.now() },
          });
        });
      });
    } catch (error) {
      return console.error(error);
    }
  });
