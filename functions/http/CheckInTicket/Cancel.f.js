import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { checkInTicket as object, voucher as subject } from "../../z-tools/system/objectsConfig";
import { user as directObject } from "../../z-tools/marslab-library-cloud-function/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "checkInTicket";
const subjectName = "voucher";
const directObjectName = "user";
const event = "Cancel";
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

    const objectIds = [data.id];

    const subjectIds = data.voucherIds

    const directObjectIds = [uid];

   //console.log("data:"+JSON.stringify(data))

    //Read other object
    const readUsers = objectDataServices.read({
      objectName: directObjectName,
      objectIds: directObjectIds,
    });

    const readCheckIn = objectDataServices.read({
      objectName: objectName,
      objectIds: objectIds
    })

    const readVoucher = objectDataServices.read({
      objectName: subjectName,
      objectIds: subjectIds
    })

    const readPromise = await Promise.all([readUsers, readCheckIn, readVoucher]);

    const user = readPromise[0]
    let checkInTicket = readPromise[1]
    const voucher = readPromise[2]
    
    //Object verification
    if (user === undefined || user === null) {
      backendServices.data.objectNotExist({ message: "User not exist." });
    }

    if (checkInTicket === undefined || checkInTicket === null) {
      backendServices.data.objectNotExist({ message: "Check In Ticket not found." })
    }

    if (voucher === undefined || checkInTicket === null) {
      backendServices.data.objectNotExist({ message: "Voucher not found." })
    }

    //console.log('user'+JSON.stringify(user))
    //console.log('checkInTicket'+JSON.stringify(checkInTicket))
    //console.log('voucher'+JSON.stringify(voucher))

    if (checkInTicket[0] !== null) {
      const oneHour = new Date(checkInTicket[0].voucher.assignedDate.at.seconds) + new Date(checkInTicket[0].voucher.assignedDate.at.seconds * 1000) / 60000

      if (checkInTicket[0].voucher.assignedDate < oneHour) {
          backendServices.data.objectNotExist({ message: "Voucher cannot be cancelled." })
      }
    }

    const initialVoucherValue = object.attributes({});

    //Data Correction
    data = { 
        ...checkInTicket[0],
        voucherIds: [],
        voucher: initialVoucherValue.packaging.voucher
    };

    //Data Processing
    const objectData = object.attributes(data);

    //console.log('objectData'+JSON.stringify(objectData))

    data = {
      checkInIds: [null]
    }

    const subjectData = subject.attributes(data);
    //console.log('subjectData'+JSON.stringify(subjectData))

    const subjectResult = await objectDataServices.update({
      objectName: subjectName,
      objectId: subjectIds,
      objectData: subjectData,
      updatedByUid: uid,
    });

    //Output
    const objectResult = await objectDataServices.update({
      objectName,
      objectId: objectIds,
      objectData,
      updatedByUid: uid,
    });

    objectId = objectResult.objectId;

    return httpUtils.successResponse({
      objectName,
      ids: [objectId],
      action: event,
      message: `Updated ${objectName} successfully.`,
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
