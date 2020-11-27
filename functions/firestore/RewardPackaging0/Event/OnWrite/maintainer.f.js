import * as functions from "firebase-functions";
import { dataServices as objectDataServices } from "../../../../z-tools/marslab-library-cloud-function/services/database";

const objectName = "reward";
const targetName = "event";

export default functions.region("asia-east2").firestore
  .document(
    `${objectName}Packaging0/{objectId}/${targetName}Packaging0/{targetId}`
  )
  .onWrite(async (snap, context) => {
    try {
      const objectId = context.params.objectId;
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

          let event = snap.after.data();
          event = {  ...event}

          //update
          if (
            snap.before.exists 
          ) {
            transaction.update(objectRef, {event});
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
