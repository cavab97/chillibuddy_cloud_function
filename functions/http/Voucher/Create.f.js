import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { voucher as object, merchant as subject } from "../../z-tools/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "voucher";
const subjectName = "merchant";
const event = "Create";
let objectIds = null;
let objectQty = null;

export default functions.https.onCall(async (data, context) => {
  try {
    //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid, role: "admin" });

    //Data Correction
    data = { 
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      amount: data.amount ? parseFloat(data.amount) : 0
    }

    //Validate Data
    const referenceData = object.attributes({});
    backendServices.data.validation({
      target: data,
      reference: referenceData.receivableState,
    });

    const subjectIds = data.merchantIds;

    //validate
    if(data.endDate && data.endDate < data.startDate && data.startDate){
      backendServices.data.unavailable({
        message: `End date cannot before start date.`,
      });
    }

    if (subjectIds.length === 0) {
      backendServices.data.objectNotExist({ message: "Merchant id required." });
    }

    //Read other object
    const readMerchants = objectDataServices.read({
      objectName: subjectName,
      objectIds: subjectIds,
    });

    const readPromise = await Promise.all([readMerchants]);

    const merchant = readPromise[0];

    if (merchant === null) {
      backendServices.data.objectNotExist({ message: "Merchant not exist." });
    }

    if (data.quantity < 1) {
      backendServices.data.objectNotExist({ message: "Quantity cannot be less than 1." });
    }

    objectQty = data.quantity;
    delete data["quantity"];
    
    let active = false;

    if (data.startDate && data.endDate) {
      if (data.startDate === objectDataServices.Time.now().toDate()){
        active = true;
      }
      if (data.endDate >= objectDataServices.Time.now().toDate()){
        active = true;
      }
    } else {
      active = true;
    }

    //Data Correction
    data = { 
      ...data, 
      merchant: merchant,
      active: active
    }

    const objectsArray = [];

    for(let i = 0; i < objectQty; i++){
      //Data Processing
      const objectData = object.attributes({...data, [subjectName]:merchant});

      const subjectObjectRelation = subject.relation.merchant.create.voucher.asChild({
        subjectName,
        subjectIds,
      });

      objectsArray.push({ 
        packaging: objectData.packaging, 
        shared: objectData.shared, 
        confidential: objectData.confidential, 
        subjectObjectRelation,
      });
    }

    //Output
    const result = await objectDataServices.createObjectsWithRelation({
      objectName,
      objectData: objectsArray,
      createdByUid: uid,
      relatedParties: [
        {
          partyName: subjectName,
          partyId: subjectIds[0],
          partyData: merchant,
        },
      ],
    });

    objectIds = result.objectIds;

    return httpUtils.successResponse({
      objectName,
      ids: [objectIds],
      action: event,
      message: `Created ${objectName} successfully.`,
    });
  } catch (error) {
    const { code, message } = error;

    console.log(error);

    httpUtils.failedResponse({
      code: code,
      objectName,
      ids: [objectIds],
      action: event,
      message: message,
    });
    return error;
  }
});
