import * as functions from "firebase-functions";
import { dataServices as objectDataServices } from "../../../../z-tools/marslab-library-cloud-function/services/database";

const objectName = "shop";
const targetName = "promotion";

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

        return transaction.getAll(objectRef, idempotentRef).then(async (docs) => {
          const object = docs[0];
          const idempotent = docs[1];

          if (!object.exists) {
            throw Object("Object does not exist!");
          }

          if (idempotent.exists) {
            return console.log("Function trigger repeatly.");
          }
          
          let { isPromote } = object.data().d;
          const timeNow = objectDataServices.Time.now();

          if(isPromote === undefined)
            isPromote = false;

          if (
            snap.before.exists &&
            isPromote === false && 
            snap.before.data().d.started !== snap.after.data().d.started && 
            snap.after.data().d.started.boolean
          ) {
            isPromote = true;
            transaction.update(objectRef, {
              ["d.isPromote"]: isPromote,
            });
          }

          if (
            snap.before.exists && 
            isPromote === true &&
            (
              (
                snap.before.data().d.ended !== snap.after.data().d.ended && 
                snap.after.data().d.ended.at !== null
              ) || (
                snap.before.data().d.deleted !== snap.after.data().d.deleted && 
                snap.after.data().d.deleted.at !== null
              )
            )
          ) {
            const targetSnapShot = await objectDataServices.db
              .collection(`${objectName}Packaging0/${objectId}/${targetName}Packaging0`)
              .where("d.started.boolean", "==", true)
              .where("d.ended.boolean", "==", false)
              .where("d.deleted.at", "==", null)
              .get();

            const promotionIds = [];
            targetSnapShot.forEach((docSnapShot) => {
              const promotionId = docSnapShot.data().id;
              promotionIds.push(promotionId);
            });

            if(promotionIds.length === 0){
              isPromote = false;
              transaction.update(objectRef, {
                ["d.isPromote"]: isPromote,
              });
            }
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
