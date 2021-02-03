import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { voucher as object, checkInTicket as subject } from "../../z-tools/system/objectsConfig";
import { user as directObject } from "../../z-tools/marslab-library-cloud-function/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const subjectName = "checkInTicket";
const objectName = "voucher";
const directObjectName = "user";
const event = "Redeem";
let objectId = null;

const days = 21;
const maximumCheckIn = 28;

export default functions.https.onCall(async (data, context) => {
  try {
    //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid });

    //Data Correction
    data = { 
      ...data
    }

    //Validate Data
    const referenceData = object.attributes({});
    backendServices.data.validation({
      target: data,
      reference: referenceData.receivableState,
    });

    if (data.merchantIds === undefined || data.merchantIds === null ) {
      backendServices.data.objectNotExist({
        message:"Invalid merchant. Please try again."
      })
    }

    const subjectIds = data.merchantIds;

    const directObjectIds = [uid];

    //Read other object
    const readUsers = objectDataServices.read({
      objectName: directObjectName,
      objectIds: directObjectIds,
    });

    const readCheckIn = objectDataServices.db
      .collection(`${subjectName}Private0`)
      .where("userIds", "array-contains", uid)
      .where("status", "==", true)
      .get()

    const readVoucher = objectDataServices.read({
      objectName: objectName,
      objectIds: [data.id]
    })

    const readPromise = await Promise.all([readUsers, readCheckIn, readVoucher]);

    const user = readPromise[0]
    const checkInTicket = readPromise[1]
    let checkInTicketData = []

    checkInTicket.forEach((doc)=>{
      const checkIn = doc.data();
      checkInTicketData.push(checkIn); 
    })

    const voucher = readPromise[2]
    
    //Object verification
    if (user === undefined || user.length === 0) {
      backendServices.data.objectNotExist({ message: "User not exist." });
    }

    if (checkInTicketData === undefined || checkInTicketData.length === 0) {
      backendServices.data.objectNotExist({ message: "Check In Ticket not found." })
    }

    if (voucher === undefined || voucher.length === 0 || voucher === [null]) {
      backendServices.data.objectNotExist({ message: "Invalid voucher." })
    }

    if (voucher[0].merchantIds !== subjectIds) {
      backendServices.data.objectNotExist({ message: "This voucher does not belong to this merchant" })
    }

    if (checkInTicketData[0].voucherIds !== [data.id]) {
      backendServices.data.objectNotExist({ message: "This voucher does not belong to this merchant" })
    }

    //Data Correction
    data = { 
      ...data, 
      user, 
      userIds: directObjectIds,
      claimed: true,
      active: false,
      usedDate: { at: new Date(), by: uid },
    };

    //Data Processing
    const objectData = object.attributes(data);

    //Output
    const result = await objectDataServices.update({
      objectName,
      objectId: data.id,
      objectData,
      updatedByUid: uid,
    });

    objectId = result.objectId;

    return httpUtils.successResponse({
      objectName,
      ids: [objectId],
      action: event,
      message: `Redeem ${objectName} successfully.`,
    });
  } catch (error) {
    const { code, message } = error;

    console.log(error);

    if (code)
      httpUtils.failedResponse({
        code: code,
        objectName,
        ids: [objectId],
        action: event,
        message: message,
      });

    return error;
  }
});
