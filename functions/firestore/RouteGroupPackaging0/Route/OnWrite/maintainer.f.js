import * as functions from "firebase-functions";
import { dataServices as objectDataServices } from "../../../../z-tools/marslab-library-cloud-function/services/database";

const objectName = "routeGroup";
const targetName = "route";

export default functions.region("asia-east2").firestore
  .document(
    `${objectName}Packaging0/{objectId}/${targetName}Packaging0/{targetId}`
  )
  .onWrite(async (snap, context) => {
    try {
      const {objectId, targetId} = context.params;
      const functionEventId = context.eventId;

      return await objectDataServices.db.runTransaction((transaction) => {
        const objectRef = objectDataServices.db.doc(
          `${objectName}Private0/${objectId}`
        );
        const idempotentRef = objectDataServices.db.doc(
          `log/function/eventId/${functionEventId}`
        );
        const routeRef = objectDataServices.db.doc(
          `routePrivate0/${targetId}`
        );

        return transaction.getAll(objectRef, idempotentRef,routeRef).then(async (docs) => {
          const object = docs[0];
          const idempotent = docs[1];
          const route = docs[2];

          if (!object.exists) {
            throw Object("Object does not exist!");
          }

          if (idempotent.exists) {
            return console.log("Function trigger repeatly.");
          }

          //If count still unaccurate, then read all related routePrivate0, count manually
          //and update result. By yong kok lun 8 May 2020, 10:43 pm.

          let totalRoutes = 0;
          let pendingRoutes = 0;
          let ongoingRoutes = 0;
          let endRoutes = 0;
          

          if (snap.before.exists){
            // read other object
            const routesSnapShot = await objectDataServices.db
                            .collection(`routePrivate0`)
                            .where("routeGroupId", "array-contains", objectId)
                            .where("published.boolean", "==", true)
                            .where("deleted.at", "==", null)
                            .where("terminated.boolean", "==", false)
                            .get()

            const routes = [];
            routesSnapShot.forEach((docSnapShot)=>{
              const route = docSnapShot.data();
              routes.push(route);
            })

            totalRoutes = routes.length;

            routes.forEach((route) => {
              
              if(route.ended.boolean){
                endRoutes = ++endRoutes;

              }else if(route.ongoing.boolean){
                ongoingRoutes = ++ongoingRoutes;

              }else if(route.pending.boolean){
                pendingRoutes = ++pendingRoutes;
              }
            });

          }

          /* let {
            totalRoutes,
            pendingRoutes,
            ongoingRoutes,
            endRoutes,
          } = object.data().d;

          if (
            snap.before.exists &&
            snap.before.data().published.at === null &&
            snap.after.data().published.at !== null
          ) {
            totalRoutes = ++totalRoutes;
          }

          if (
            snap.before.exists &&
            snap.before.data().pending.at === null &&
            snap.after.data().pending.at !== null
          ) {
            pendingRoutes = ++pendingRoutes;
          }

          if (
            snap.before.exists &&
            snap.before.data().ongoing.at === null &&
            snap.after.data().ongoing.at !== null
          ) {
            pendingRoutes = --pendingRoutes;
            ongoingRoutes = ++ongoingRoutes;
          }

          if (
            snap.before.exists &&
            snap.before.data().ended.at === null &&
            snap.after.data().ended.at !== null &&
            snap.before.data().published.at !== null &&
            snap.after.data().published.at !== null &&
            snap.before.data().terminated.at === null &&
            snap.after.data().terminated.at === null &&
            snap.before.data().deleted.at === null && 
            snap.after.data().deleted.at === null 
          ) {
              endRoutes = ++endRoutes;

            if (snap.after.data().ongoing.at) {
              ongoingRoutes = --ongoingRoutes;
            } else {
              pendingRoutes = --pendingRoutes;
            }
          }

          if (
            snap.before.exists &&
            snap.before.data().terminated.at === null &&
            snap.after.data().terminated.at !== null
          ) {
            if (snap.after.data().ended.at) {
              totalRoutes = --totalRoutes;
              endRoutes = --endRoutes;
            } else if (snap.after.data().ongoing.at) {
              totalRoutes = --totalRoutes;
              ongoingRoutes = --ongoingRoutes;
            } else if (snap.after.data().pending.at) {
              totalRoutes = --totalRoutes;
              pendingRoutes = --pendingRoutes;
            }
          }

          if (
            snap.before.exists &&
            snap.before.data().deleted.at === null &&
            snap.after.data().deleted.at !== null &&
            !snap.after.data().terminated.at
          ) {
            if (snap.after.data().ended.at) {
              totalRoutes = --totalRoutes;
              endRoutes = --endRoutes;
            } else if (snap.after.data().ongoing.at) {
              totalRoutes = --totalRoutes;
              ongoingRoutes = --ongoingRoutes;
            } else if (snap.after.data().pending.at) {
              totalRoutes = --totalRoutes;
              pendingRoutes = --pendingRoutes;
            }
          } */

          

          transaction.update(objectRef, {
            ["d.totalRoutes"]: totalRoutes,
            ["d.pendingRoutes"]: pendingRoutes,
            ["d.ongoingRoutes"]: ongoingRoutes,
            ["d.endRoutes"]: endRoutes,
          });

          return transaction.set(idempotentRef, {
            actived: { at: objectDataServices.Time.now() },
          });
        });
      });
    } catch (error) {
      return console.error(error);
    }
  });
