import * as functions from "firebase-functions";
import {
  dataServices as objectDataServices,
  dataServices,
} from "../../../../z-tools/marslab-library-cloud-function/services/database";

const objectName = "route";
const targetName = "routeTicket";

export default functions
  .region("asia-east2")
  .firestore.document(
    `${objectName}Packaging0/{objectId}/${targetName}Packaging0/{targetId}`
  )
  .onWrite(async (snap, context) => {
    try {
      const { objectId, targetId } = context.params;
      const functionEventId = context.eventId;

      return objectDataServices.db.runTransaction((transaction) => {
        const objectRef = objectDataServices.db.doc(
          `${objectName}Private0/${objectId}`
        );

        const routeTicketRef = objectDataServices.db.doc(
          `routeTicketPrivate0/${targetId}`
        );

        const idempotentRef = objectDataServices.db.doc(
          `log/function/eventId/${functionEventId}`
        );

        return transaction
          .getAll(objectRef, idempotentRef, routeTicketRef)
          .then(async (docs) => {
            const object = docs[0];
            const idempotent = docs[1];
            const routeTicket = docs[2].data();

            if (!object.exists) {
              throw Object("Object does not exist!");
            }

            if (idempotent.exists) {
              return console.log("Function trigger repeatly.");
            }

            let {
              currentUser,
              totalMissions,
              assignedRewards,
              totalRewards,
              minimumUser,
              ended,
            } = object.data();

            const uid = snap.after.data().userIds[0];

            //increase user counter
            if (!snap.before.exists) {
              currentUser = ++currentUser;
              transaction.update(objectRef, {
                currentUser,
              });

              if (currentUser === minimumUser) {
                const ongoing = {
                  at: objectDataServices.Time.now(),
                  by: uid,
                  boolean: true,
                };
                transaction.update(objectRef, {
                  ongoing,
                });
              }
            }

            //assign reward
            /* if (
              snap.before.exists &&
              !ended.boolean &&
              snap.after.data().numberCompletedMissions !==
                snap.before.data().numberCompletedMissions &&
              snap.after.data().numberCompletedMissions === totalMissions &&
              !routeTicket.rewardIds[0]
            ) {
              const reward = await objectDataServices.db
                .collection(
                  `${objectName}Packaging0/${objectId}/rewardPackaging0`
                )
                .where("deleted.by", "==", null)
                .orderBy("rank", "asc")
                .get();

              const rewardId = reward.docs[assignedRewards].id;

              assignedRewards = ++assignedRewards;

              const rewardRef = objectDataServices.db.doc(
                `rewardPrivate0/${rewardId}`
              );

              const routeTicketIds = [targetId];
              const user = snap.after.data().user;
              const userIds = snap.after.data().userIds;
              const obtained = {
                at: objectDataServices.Time.now(),
                by: userIds[0],
              };

              transaction.update(rewardRef, {
                routeTicketIds,
                user,
                userIds,
                obtained,
              });

              if (assignedRewards === totalRewards) {
                const ended = {
                  at: dataServices.Time.now(),
                  by: snap.after.data().userIds[0],
                  boolean: true,
                };
                transaction.update(objectRef, {
                  ended,
                  assignedRewards,
                });
              } else {
                transaction.update(objectRef, {
                  assignedRewards,
                });
              }
            } */

            return transaction.set(idempotentRef, {
              actived: { at: objectDataServices.Time.now() },
            });
          });
      });
    } catch (error) {
      return console.error(error);
    }
  });
