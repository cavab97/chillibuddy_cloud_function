import * as functions from "firebase-functions";
import { voucher as object } from "../../z-tools/system/objectsConfig";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";

const objectName = "voucher";

export default functions.region("asia-east2").pubsub
  .schedule("every 5 minutes")
  .onRun(async (context) => {
    try {
      const activedVoucherIds = [];

      await objectDataServices.db
        .collection(`${objectName}Private0`)
        .where("startDate", "<=", objectDataServices.Time.now())
        .where("deleted.at", "==", null)
        .get()
        .then((activedVoucher) => {
            activedVoucher.forEach((voucher) => {
                activedVoucherIds.push(voucher.id);
          });
          return activedVoucherIds;
        });

      const writePromise = []

      activedVoucherIds.forEach((voucherId)=>{
        const ref = `${objectName}Private0/${voucherId}`
        const update = objectDataServices.db.doc(ref).update({
            ["active"]: true,
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
