import * as functions from "firebase-functions";
import { shopPost as object } from "../../z-tools/system/objectsConfig";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";

const objectName = "shopPost";

export default functions.region("asia-east2").pubsub
  .schedule("every 5 minutes")
  .onRun(async (context) => {
    try {
      const expiredShopPostIds = [];
      
      const readShopPost = await objectDataServices.db
        .collection(`${objectName}Private0`)
        .where("d.endTime", "<=", objectDataServices.Time.now())
        .where("d.ended.at", "==", null)
        .where("deleted.at", "==", null)
        .get()

      readShopPost.forEach((shopPost)=>{
        expiredShopPostIds.push(shopPost.id);
      })

      const ended = {
        at: objectDataServices.Time.now(),
        by: "system",
        boolean: true,
      };

      const writePromise = []

      expiredShopPostIds.forEach((shopPostId)=>{
        const ref = `${objectName}Private0/${shopPostId}`
        const update = objectDataServices.db.doc(ref).update({["d.ended"]: ended})
        writePromise.push(update)
      })

      return await Promise.all(writePromise)
    } catch (error) {
      return console.log(error);
    }
  });
