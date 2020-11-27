import * as functions from "firebase-functions";
import { route as object } from "../../z-tools/system/objectsConfig";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";

const objectName = "route";

export default functions.region("asia-east2").pubsub
  .schedule("every 5 minutes")
  .onRun(async (context) => {
    try {
      const expiredRouteIds = [];

      await objectDataServices.db
        .collection(`${objectName}Private0`)
        .where("published.boolean", "==", true)
        .where("endTime", "<=", objectDataServices.Time.now())
        .where("ended.at", "==", null)
        .get()
        .then((expiredRoutes) => {
          expiredRoutes.forEach((route) => {
            expiredRouteIds.push(route.id);
          });
          return expiredRouteIds;
        });

      const ended = {
        at: objectDataServices.Time.now(),
        by: "system",
        boolean: true,
      };

      const writePromise = []

      expiredRouteIds.forEach((routeId)=>{
        const ref = `${objectName}Private0/${routeId}`
        const update = objectDataServices.db.doc(ref).update({ended})
        writePromise.push(update)
      })

      return await Promise.all(writePromise)
    } catch (error) {
      return console.log(error);
    }
  });
