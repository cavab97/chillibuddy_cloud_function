import * as functions from "firebase-functions";
import { dataServices as objectDataServices } from "../../../z-tools/marslab-library-cloud-function/services/database";
import { notification as object } from "../../../z-tools/marslab-library-cloud-function/system/objectsConfig";

const objectName = "notification";
const targetName = "user";

export default functions.region("asia-east2").firestore
  .document(`${objectName}Packaging0/{objectId}`)
  .onCreate(async (snap, context) => {
    try {
      const { objectId } = context.params;
      const functionEventId = context.eventId;

      const data = snap.data();
      const { userListRef, userIds } = data;

      //read user list ids
      let userList = null;

      if (userIds.length === 0 && userListRef) {
        userList = await objectDataServices.db.collection(userListRef).get();
        userList = userList.docs.map((doc) => {
          return doc.id;
        });
      } else {
        userList = userIds;
      }

      if (userList.length === 0) {
        return null;
      }

      const parties = userList.map((id) => {
        return { partyName: targetName, partyId: id };
      });

      const objectData = object.attributes(data);

      return objectDataServices.distributeObject({
        objectName,
        objectId,
        objectData,
        parties,
      });
    } catch (error) {
      return console.error(error);
    }
  });
