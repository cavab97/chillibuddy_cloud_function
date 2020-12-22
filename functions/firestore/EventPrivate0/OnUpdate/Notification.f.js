import * as functions from "firebase-functions";
import { dataServices as targetDataServices } from "../../../z-tools/marslab-library-cloud-function/services/database";
import {
  event as object,
  notification as target,
} from "../../../z-tools/marslab-library-cloud-function/system/objectsConfig";

const objectName = "event";
const targetName = "notification";

export default functions
  .region("asia-east2")
  .firestore.document(`${objectName}Private0/{objectId}`)
  .onUpdate(async (snap, context) => {
    console.log("eventPrivate notification.f.js");

    try {
      const { objectId } = context.params;
      const functionEventId = context.eventId;
      let data = {};
      let targetData = {};

      if (snap.before.data().published.at === null && snap.after.data().published.at !== null) {
        data = {
          userListRef: `userPrivate0`,
          data: {
            objectName,
            objectId,
            action: "published",
          },
          title: `${snap.after.data().title} started`,
          body: "Unlock more routes to earn chances to win in this event.",
          priority: "normal",
          channelId: `default`,
        };

        //Data Processing
        targetData = target.attributes(data);

        const subjectObjectRelation = object.relation.event.create.notification.toUser({
          objectName,
          objectIds: [objectId],
        });

        return targetDataServices.createWithRelation({
          objectName: targetName,
          objectData: targetData,
          createdByUid: objectId,
          relatedParties: [
            {
              partyName: objectName,
              partyId: objectId,
              partyData: snap.after.data(),
            },
          ],
          subjectObjectRelation,
        });
      }
      return null;
    } catch (error) {
      return console.error(error);
    }
  });
