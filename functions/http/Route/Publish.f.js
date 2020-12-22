import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { route as object } from "../../z-tools/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "route";
const event = "Publish";
let objectId = null;

export default functions.https.onCall(async (data, context) => {
  console.log("publish");
  try {
    //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid, role: "admin" });

    //read other object
    const routes = await objectDataServices.read({ objectName, objectIds: [data.id] });
    const route = routes[0];

    if (route.published.by) {
      backendServices.data.objectExist({ message: "The route had published before." });
    }
    if (route.totalRewards <= 0) {
      backendServices.data.invalidArgument({ message: "At least one reward to start the route." });
    }
    if (route.totalMissions > route.station) {
      backendServices.data.invalidArgument({ message: "Maximum missions is " + route.station });
    }
    if (route.totalMissions < route.station) {
      backendServices.data.invalidArgument({ message: "At least " + route.station + " missions" });
    }
    if (route.totalMissions <= 0) {
      backendServices.data.objectExist({ message: "At least one mission to start the route." });
    }

    const publishData =
      route.minimumUser <= 0
        ? {
            published: {
              at: objectDataServices.Time.now(),
              by: uid,
              boolean: true,
            },
            pending: { at: objectDataServices.Time.now(), by: uid, boolean: true },
            // ongoing: route.startTime <= objectDataServices.Time.now() ? { at: objectDataServices.Time.now(), by: uid, boolean:true }
            // : { at: null, by: null, boolean:false },
            ongoing: { at: objectDataServices.Time.now(), by: uid, boolean: true },
          }
        : {
            published: {
              at: objectDataServices.Time.now(),
              by: uid,
              boolean: true,
            },
            pending: { at: objectDataServices.Time.now(), by: uid, boolean: true },
            ongoing: { at: null, by: null, boolean: false },
          };

    //Data Processing
    const objectData = object.attributes(publishData).publishObjectState;

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
      message: `Publish ${objectName} successfully.`,
    });
  } catch (error) {
    const { code, message } = error;

    console.log(error);

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
