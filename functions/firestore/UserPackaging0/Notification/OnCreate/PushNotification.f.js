import * as functions from "firebase-functions";
import { dataServices as objectDataServices } from "../../../../z-tools/marslab-library-cloud-function/services/database";
import { notification } from "../../../../z-tools/marslab-library-cloud-function/utils/helper";
import { user as object } from "../../../../z-tools/marslab-library-cloud-function/system/objectsConfig";

const objectName = "user";
const targetName = "notification";

export default functions
  .region("asia-east2")
  .firestore.document(
    `${objectName}Packaging0/{objectId}/${targetName}Packaging0/{targetId}`
  )
  .onCreate(async (snap, context) => {
    try {
      const { objectId, targetId } = context.params;
      const functionEventId = context.eventId;

      const idempotentRef = objectDataServices.db.doc(
        `log/function/eventId/${functionEventId}`
      );

      const target = snap.data();

      const readIdempotent = idempotentRef.get()

      const readUser = objectDataServices.read({
        objectName,
        objectIds: [objectId],
        dataCategory: "Private0",
      });

      const readPromises = await Promise.all([ readIdempotent, readUser ])

      const idempotent = readPromises[0]

      if(idempotent.exists){
        return console.log("Function trigger repeatly.");
      }

      const user = readPromises[1]

      const { notificationToken } = user[0];

      const validatedNotificationToken = [];

      notificationToken.forEach((token) => {
        if (token) {
          validatedNotificationToken.push(token);
        }
        return null;
      });

      const {
        title,
        body,
        data,
        subtitle,
        sound,
        badge,
        channelId,
        priority,
        ttl,
        expiration,
      } = target;

      const message = {
        to: validatedNotificationToken,
        title,
        body,
        data,
        subtitle,
        sound,
        badge,
        channelId,
        priority,
        ttl,
        expiration,
      };

      if (validatedNotificationToken.length === 0) {
        return null;
      }

      const notificationResult = await notification.sendToNotificationServer(
        message
      );

      const unregisterToken = notification.validateToken(
        validatedNotificationToken,
        notificationResult
      );

      const objectData = object.attributes(data).notificationTokenState;

      if (unregisterToken.length !== 0) {
        unregisterToken.forEach(async (token) => {
          return await objectDataServices.update({
            objectName,
            objectData,
            objectId,
            objectArrayRemoveData: { notificationToken: token },
            updatedByUid: objectId,
          });
        });
      }

      return idempotentRef.set({
        actived: { at: objectDataServices.Time.now() },
      });
    } catch (error) {
      const { objectId, targetId } = context.params;
      console.error(objectId);
      return console.error(error);
    }
  });
