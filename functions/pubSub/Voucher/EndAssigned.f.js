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
        .where("d.endDate", "<=", objectDataServices.Time.now())
        .where("d.assigned", "==", true)
        .where("d.active", "==", false)
        .where("d.usedDate.at", "==", null)
        .get()
        .then((expiredVoucher) => {
          expiredVoucher.forEach((voucher) => {
            expiredVoucherIds.push(voucher.id);
          });
          return expiredVoucherIds;
        });

      const assigned = false;
      const active = true;
      const userIds = [null];
      const user = {};

      const writePromise = [];

      expiredVoucherIds.forEach((voucherId) => {
        const ref = `${objectName}Private0/${voucherId}`;
        const prevUserIds = voucherId.d.userIds;
        const prevUser = voucherId.d.user;
        const prevAssignedDate = voucherId.d.assignedDate;
        const assignedDate = { at: null, by: null };
        const endDate = new Date();

        const update = objectDataServices.db
          .doc(ref)
          .update(
            { ["d.assigned"]: assigned },
            { ["d.active"]: active },
            { ["d.prevUserIds"]: prevUserIds },
            { ["d.userIds"]: userIds },
            { ["d.prevUser"]: prevUser },
            { ["d.user"]: user },
            { ["d.prevAssignedDate"]: prevAssignedDate },
            { ["d.assignedDate"]: assignedDate },
            { ["d.endDate"]: endDate }
          );
        writePromise.push(update);
      });

      return await Promise.all(writePromise);
    } catch (error) {
      return console.log(error);
    }
  });
