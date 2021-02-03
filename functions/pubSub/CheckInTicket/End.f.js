import * as functions from "firebase-functions";
import { checkInTicket as object } from "../../z-tools/system/objectsConfig";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";

const objectName = "checkInTicket";

export default functions.region("asia-east2").pubsub
  .schedule("every 5 minutes")
  .onRun(async (context) => {
    try {
      const expiredCheckInTicketIds = [];

      await objectDataServices.db
        .collection(`${objectName}Private0`)
        .where("resetDate", "<=", objectDataServices.Time.now())
        .where("deleted.at", "==", null)
        .get()
        .then((expiredCheckInTicket) => {
          expiredCheckInTicket.forEach((checkInTicket) => {
            expiredCheckInTicketIds.push(checkInTicket.id);
          });
          return expiredCheckInTicketIds;
        });

      const writePromise = []

      expiredCheckInTicketIds.forEach((checkInTicketId)=>{
        const ref = `${objectName}Private0/${checkInTicketId}`
        const update = objectDataServices.db.doc(ref).update({
          ["status"]: false, 
          ["updated.at"]: objectDataServices.Time.now(), 
          ["updated.by"]: "system" 
        })
        writePromise.push(update)
      })

      return await Promise.all(writePromise)
    } catch (error) {
      return console.log(error);
    }
  });
