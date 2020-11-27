import * as functions from "firebase-functions";
import {
  dataServices as objectDataServices,
  dataServices as targetDataServices,
} from "../../../z-tools/marslab-library-cloud-function/services/database";
import {
  route,
  event,
  reward as object,
  notification as target,
} from "../../../z-tools/marslab-library-cloud-function/system/objectsConfig";

const objectName = "reward";
const targetName = "notification";
let subject = {};
let subjectName = null;
let subjectIds = [];


export default functions.region("asia-east2").firestore
  .document(`${objectName}Private0/{objectId}`)
  .onUpdate(async (snap, context) => {
    try {
      const { objectId } = context.params;
      const functionEventId = context.eventId;
      let data = {};
      let targetData = {};
      let userIds = [];

      if (snap.after.data().routeIds.length !== 0) {
        subject = route;
        subjectName = "route";
        subjectIds = snap.after.data().routeIds;
      } else {
        subject = event;
        subjectName = "event";
        subjectIds = snap.after.data().eventIds;
      }

      //Create notification when reward obtained by user
      if (
        snap.before.data().obtained.by === null &&
        snap.after.data().obtained.by !== null
      ) {
        userIds = [snap.after.data().obtained.by];
        data = {
          userListRef: null,
          userIds,
          data: {
            objectName,
            objectId,
            action: "obtained",
          },
          title: `Congratulation`,
          body: `You had win rank ${snap.after.data().rank} in this ${subjectName} ${snap.after.data()[subjectName].title}, with the reward ${snap.after.data().title}.`,
          priority: "high",
          channelId: `default`,
        };

        //Data Processing
        targetData = target.attributes(data);

        const subjectObjectRelation = subject.relation[subjectName].create.notification.toUser(
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

      //Create notification when gogogain issued the reward
      if (
        snap.before.data().claimed.by === null &&
        snap.after.data().claimed.by !== null
      ) {
        userIds = [snap.after.data().obtained.by];
        data = {
          userListRef: null,
          userIds,
          data: {
            objectName,
            objectId,
            action: "issued",
          },
          title: `Congratulation`,
          body: `You had claimed ${snap.after.data().title} in this ${[subjectName]} ${snap.after.data()[subjectName].title}.`,
          priority: "high",
          channelId: `default`,
        };

        //Data Processing
        targetData = target.attributes(data);

        const subjectObjectRelation = subject.relation[subjectName].create.notification.toUser(
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
