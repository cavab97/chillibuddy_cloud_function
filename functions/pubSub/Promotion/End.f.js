import * as functions from "firebase-functions";
import { promotion as object } from "../../z-tools/system/objectsConfig";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";

const objectName = "promotion";

export default functions
  .region("asia-east2")
  .pubsub.schedule("every 5 minutes")
  .onRun(async (context) => {
    try {
      const expiredPromotionIds = [];
      console.log("end");
      await objectDataServices.db
        .collection(`${objectName}Private0`)
        .where("d.endTime", "<=", objectDataServices.Time.now())
        .where("d.ended.at", "==", null)
        .where("d.deleted.at", "==", null)
        .get()
        .then((expiredPromotion) => {
          expiredPromotion.forEach((promotion) => {
            expiredPromotionIds.push(promotion.id);
          });
          return expiredPromotionIds;
        });

      const ended = {
        at: objectDataServices.Time.now(),
        by: "system",
        boolean: true,
      };

      const writePromise = [];

      expiredPromotionIds.forEach((promotionId) => {
        const ref = `${objectName}Private0/${promotionId}`;
        const update = objectDataServices.db.doc(ref).update({ ["d.ended"]: ended });
        writePromise.push(update);
      });

      return await Promise.all(writePromise);
    } catch (error) {
      return console.log(error);
    }
  });
