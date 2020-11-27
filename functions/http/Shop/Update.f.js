import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { shopDataServices as objectDataServices } from "../../z-tools/services/database";
import { shop as object } from "../../z-tools/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "shop";
const event = "Update";
let objectId = null;

export default functions.https.onCall(async (data, context) => {
  try {
    //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid, role: "admin" });

    //Data Correction
    data = { 
      ...data, 
      l: objectDataServices.GeoPoint( data.l._lat, data.l._long ),
      dateJoined: new Date(data.dateJoined)
    }

    //Validate Data
    const referenceData = object.attributes({});
    backendServices.data.validation({
      target: data,
      reference: referenceData.initialState
    });

    //Data Processing
    const objectData = object.attributes(data);

    //Output
    const result = await objectDataServices.update({
      objectId: data.id,
      objectData,
      updatedByUid: uid
    });

    objectId = result.objectId;

    return httpUtils.successResponse({
      objectName,
      ids: [objectId],
      action: event,
      message: `Update shop successfully.`
    });
  } catch (error) {
    const { code, message } = error;

    console.log(error);

    httpUtils.failedResponse({
      code: code,
      objectName,
      ids: [objectId],
      action: event,
      message: message
    });
    return error;
  }
});
