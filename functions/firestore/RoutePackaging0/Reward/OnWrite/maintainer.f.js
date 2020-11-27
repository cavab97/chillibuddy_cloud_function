import * as functions from "firebase-functions";
import { dataServices as objectDataServices } from "../../../../z-tools/marslab-library-cloud-function/services/database";

const objectName = "route";
const targetName = "reward";

export default functions.region("asia-east2").firestore
  .document(
    `${objectName}Packaging0/{objectId}/${targetName}Packaging0/{targetId}`
  )
  .onWrite(async (snap, context) => {
    try {
      const { objectId } = context.params;
      const functionEventId = context.eventId;

      return await objectDataServices.db.runTransaction((transaction) => {
        const objectRef = objectDataServices.db.doc(
          `${objectName}Private0/${objectId}`
        );
        const idempotentRef = objectDataServices.db.doc(
          `log/function/eventId/${functionEventId}`
        );

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
            totalRewards, 
            winner, 
            assignedRewards
          } = object.data();

          if (!snap.before.exists) {
            totalRewards = ++totalRewards;
            transaction.update(objectRef, {
              totalRewards,
            });
          }

          if (
            snap.before.exists &&
            snap.after.data().rank === 1 &&
            snap.before.data().obtained.at === null &&
            snap.after.data().obtained.at !== null
          ) {
            winner = {
              at: snap.after.data().obtained.at,
              by: snap.after.data().obtained.by,
              displayName: snap.after.data().user.displayName,
              prizeTitle: snap.after.data().title,
            };
            transaction.update(objectRef, {
              winner,
            });
          }

          if (
            snap.before.exists &&
            snap.before.data().obtained.at === null &&
            snap.after.data().obtained.at !== null
          ) {
            assignedRewards = ++assignedRewards;
            
            transaction.update(objectRef, {
              assignedRewards,
            });
          }

          if (
            snap.before.exists &&
            snap.before.data().deleted.at === null &&
            snap.after.data().deleted.at
          ) {
            totalRewards = --totalRewards;
            transaction.update(objectRef, {
              totalRewards,
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
