import * as functions from "firebase-functions";
import { dataServices as objectDataServices } from "../../../../z-tools/marslab-library-cloud-function/services/database";

const objectName = "routeTicket";
const targetName = "reward";

export default functions
  .region("asia-east2")
  .firestore.document(`${objectName}Packaging0/{objectId}/${targetName}Packaging0/{targetId}`)
  .onWrite(async (snap, context) => {
    console.log("routeTicket rewardMaintainer.f.js");

    try {
      const objectId = context.params.objectId;

      return await objectDataServices.db.runTransaction((transaction) => {
        const objectRef = objectDataServices.db.doc(`${objectName}Private0/${objectId}`);
        const functionEventId = context.eventId;
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

          let reward = snap.after.data();
          const rewardIds = [snap.after.data().id];

          reward = { ...reward };

          //update
          if (!snap.before.exists) {
            transaction.update(objectRef, { reward, rewardIds });
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
