import * as functions from "firebase-functions";
import {
  dataServices as objectDataServices,
  dataServices as targetDataServices,
} from "../../../z-tools/marslab-library-cloud-function/services/database";
import {
  route as object,
  notification as target,
} from "../../../z-tools/marslab-library-cloud-function/system/objectsConfig";

const objectName = "route";
const targetName = "notification";

export default functions.region("asia-east2").firestore
  .document(`${objectName}Private0/{objectId}`)
  .onUpdate(async (snap, context) => {
    try {
      const { objectId } = context.params;
      const functionEventId = context.eventId;
      let data = {};
      let targetData = {};
      let userIds = [];

      //Create notification for everyone when route published
      if (
        snap.before.data().published.at === null &&
        snap.after.data().published.at !== null
      ) {
        data = {
          userListRef: `userPrivate0`,
          data: {
            objectName,
            objectId,
            action: "published",
          },
          title: `${snap.after.data().title} has launched.`,
          body: "Let having fun together!!!",
          priority: "high",
          channelId: `default`,
        };

        //Data Processing
        targetData = target.attributes(data);

        const subjectObjectRelation = object.relation.route.create.notification.toUser(
          {
            objectName,
            objectIds: [objectId],
          }
        );

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

      //Create notification when event start
      if (
        snap.before.data().ongoing.at === null &&
        snap.after.data().ongoing.at !== null
      ) {
        userIds = await getRouteTicketHolderIds(objectId);
        data = {
          userListRef: null,
          userIds,
          data: {
            objectName,
            objectId,
            action: "ongoing",
          },
          title: `${snap.after.data().title} has started.`,
          body: "Faster get youself ready!!!",
          priority: "high",
          channelId: `default`,
        };

        //Data Processing
        targetData = target.attributes(data);

        const subjectObjectRelation = object.relation.route.create.notification.toUser(
          {
            objectName,
            objectIds: [objectId],
          }
        );

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

      //Create notification when event left last 5 user to start
      if (
        snap.before.data().currentUser !== snap.after.data().currentUser &&
        snap.after.data().minimumUser - snap.after.data().currentUser === 5
      ) {
        userIds = await getRouteTicketHolderIds(objectId);
        data = {
          userListRef: null,
          userIds,
          data: {
            objectName,
            objectId,
            action: "ongoing",
          },
          title: `${snap.after.data().title} only left 5 more people to start.`,
          body: "Is time to Gearup",
          priority: "high",
          channelId: `default`,
        };

        //Data Processing
        targetData = target.attributes(data);

        const subjectObjectRelation = object.relation.route.create.notification.toUser(
          {
            objectName,
            objectIds: [objectId],
          }
        );

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

function getRouteTicketHolderIds(objectId) {
  return new Promise(async (resolve, reject) => {
    try {
      const routeTickets = await objectDataServices.db
        .collection(`${objectName}Packaging0/${objectId}/routeTicketPackaging0`)
        .get();

      const userIds = [];

      routeTickets.forEach((routeTicket) => {
        return userIds.push(routeTicket.data().userIds[0]);
      });

      return resolve(userIds);
    } catch (error) {
      return reject(error);
    }
  });
}
