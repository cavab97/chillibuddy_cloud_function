import * as functions from "firebase-functions";
import { dataServices as objectDataServices } from "../../../../z-tools/marslab-library-cloud-function/services/database";

const objectName = "mission";
const targetName = "transaction";

export default functions
  .region("asia-east2")
  .firestore.document(`${objectName}Packaging0/{objectId}/${targetName}Packaging0/{targetId}`)
  .onWrite(async (snap, context) => {
    console.log("mission transactionMaintainer.f.js");

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

          let { numberRouteTickets } = object.data().d;

          if (!snap.before.exists) {
            numberRouteTickets = ++numberRouteTickets;
            transaction.update(objectRef, {
              ["d.numberRouteTickets"]: numberRouteTickets,
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
