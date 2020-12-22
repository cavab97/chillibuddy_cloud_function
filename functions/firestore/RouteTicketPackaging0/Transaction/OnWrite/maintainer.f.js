import * as functions from "firebase-functions";
import { dataServices as objectDataServices } from "../../../../z-tools/marslab-library-cloud-function/services/database";

const objectName = "routeTicket";
const targetName = "transaction";

export default functions
  .region("asia-east2")
  .firestore.document(`${objectName}Packaging0/{objectId}/${targetName}Packaging0/{targetId}`)
  .onWrite(async (snap, context) => {
    console.log("routeTicket transactionMaintainer.f.js");

    try {
      const objectId = context.params.objectId;
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
          let {
            completedMissions = [],
            numberCompletedMissions,
            numberApprovedMission,
          } = object.data();

          if (!snap.before.exists) {
            const completedMission = {
              id: snap.after.data().missionIds[0],
              at: snap.after.data().created.at,
            };
            completedMissions.push(completedMission);
            numberCompletedMissions = ++numberCompletedMissions;

            transaction.update(objectRef, {
              completedMissions,
              numberCompletedMissions,
            });
          }

          if (
            snap.before.exists &&
            snap.before.data().approved.at === null &&
            snap.after.data().approved.at !== null
          ) {
            numberApprovedMission = ++numberApprovedMission;
            transaction.update(objectRef, {
              numberApprovedMission,
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
