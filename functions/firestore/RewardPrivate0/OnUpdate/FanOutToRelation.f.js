import * as functions from "firebase-functions";
import { reward as object, routeTicket, user } from "../../../z-tools/system/objectsConfig";
import { dataServices as objectDataServices } from "../../../z-tools/marslab-library-cloud-function/services/database";

const objectName = "reward";

export default functions
  .region("asia-east2")
  .firestore.document(`${objectName}Private0/{${objectName}Id}`)
  .onUpdate(async (snap, context) => {
    console.log("reward FanOutToRelation.f.js");

    try {
      const objectId = snap.after.id;

      const objectBeforeData = snap.before.data();
      const objectAfterData = snap.after.data();
      const objectAttributes = object.attributes(objectAfterData);

      const fanOutTargetObjectNames = object.fanOut();

      await objectDataServices.fanOutToRelation({
        objectName,
        objectId,
        objectBeforeData,
        objectAfterData,
        objectAttributes,
        fanOutTargetObjectNames,
      });

      if (snap.before.data().obtained.at !== snap.after.data().obtained.at) {
        const rewardBelong = snap.after.data().routeIds.length > 0 ? "route" : "event";

        if (rewardBelong === "route") {
          return objectDataServices.createRelation({
            subjectName: "routeTicket",
            subjectIds: snap.after.data().routeTicketIds,
            objectName,
            objectIds: [objectId],
            directObjectName: "user",
            directObjectIds: snap.after.data().userIds,
            subjectObjectRelation: routeTicket.relation.routeTicket.obtained.reward.toUser({
              subjectName: "routeTicket",
              subjectIds: snap.after.data().routeIds,
              directObjectName: "user",
              directObjectIds: snap.after.data().userIds,
            }),
          });
        }
        if (rewardBelong === "event") {
          return objectDataServices.createRelation({
            subjectName: "user",
            subjectIds: snap.after.data().userIds,
            objectName,
            objectIds: [objectId],
            subjectObjectRelation: user.relation.user.obtained.reward.asChild({
              subjectName: "user",
              subjectIds: snap.after.data().userIds,
            }),
          });
        }
      }

      return null;
    } catch (error) {
      return console.error(error);
    }
  });
