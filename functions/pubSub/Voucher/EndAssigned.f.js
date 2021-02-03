import * as functions from "firebase-functions";
import { voucher as object } from "../../z-tools/system/objectsConfig";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";

const objectName = "voucher";

export default functions
  .region("asia-east2")
  .pubsub.schedule("every 5 minutes")
  .onRun(async (context) => {
    try {
      const expiredVoucherIds = [];

      await objectDataServices.db
        .collection(`${objectName}Private0`)
        .where("expiryDate", "<=", objectDataServices.Time.now())
        .where("assigned", "==", true)
        .where("active", "==", true)
        .where("usedDate.at", "==", null)
        .get()
        .then((expiredVoucher) => {
          expiredVoucher.forEach((voucher) => {
            expiredVoucherIds.push(voucher.id);
          });
          return expiredVoucherIds;
        });

      const assigned = false;
      const active = false;
      const userIds = [];
      const user = {};

      const writePromise = [];

      expiredVoucherIds.forEach((voucherId) => {
        const ref = `${objectName}Private0/${voucherId}`;
        const prevUserIds = voucherId.userIds;
        const prevUser = voucherId.user;
        const prevAssignedDate = voucherId.assignedDate;
        const assignedDate = { at: null, by: null };
        const endDate = new Date();

        const update = objectDataServices.db
          .doc(ref)
          .update({ 
            ["assigned"]: assigned,
            ["active"]: active,
            ["prevUserIds"]: { id: voucherId, prevAssignedDate: prevAssignedDate },
            ["userIds"]: userIds,
            ["user"]: user,
            ["assignedDate"]: assignedDate 
          });
        writePromise.push(update);
      });

      return await Promise.all(writePromise);
    } catch (error) {
      return console.log(error);
    }
  });
