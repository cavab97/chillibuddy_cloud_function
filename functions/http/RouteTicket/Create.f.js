import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { routeTicket as object, route as subject } from "../../z-tools/system/objectsConfig";
import { user as directObject } from "../../z-tools/marslab-library-cloud-function/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "routeTicket";
const subjectName = "route";
const directObjectName = "user";
const event = "Create";
let objectId = null;

const maximumUsers = 100;

export default functions.https.onCall(async (data, context) => {
  console.log("create");
  try {
    //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid });

    //Validate Data
    const referenceData = object.attributes({});
    backendServices.data.validation({
      target: data,
      reference: referenceData.receivableState,
    });

    const subjectIds = data.routeIds;

    const directObjectIds = [uid];

    if (subjectIds && subjectIds.length === 0) {
      backendServices.data.objectNotExist({ message: "Route id required." });
    }

    //Read other object
    const readUsers = objectDataServices.read({
      objectName: "user",
      objectIds: directObjectIds,
    });

    const readRoutes = objectDataServices.read({
      objectName: "route",
      objectIds: subjectIds,
    });

    const checkExisted = objectDataServices.readRelatedObjects({
      subjectName,
      subjectIds,
      objectName,
      directObjectName,
      directObjectIds,
    });

    const [users, routes, RelatedObjects] = await Promise.all([
      readUsers,
      readRoutes,
      checkExisted,
    ]);

    const user = users[0];
    let route = routes[0];
    const isExisted = RelatedObjects[0][0];

    //Object verification
    if (user === null) {
      backendServices.data.objectNotExist({ message: "User not exist." });
    }

    if (route === null) {
      backendServices.data.objectNotExist({ message: "Route not exist." });
    }

    if (isExisted) {
      backendServices.data.objectExist({
        message: "The route unlocked before.",
      });
    }

    if (route.currentUser >= maximumUsers) {
      backendServices.data.objectExhausted({
        message: "The route had exceed maximum value.",
      });
    }

    if (!route.published.at || objectDataServices.Time.now().seconds < route.startTime.seconds) {
      backendServices.data.unavailable({
        message: "The route currently unavailable.",
      });
    }

    if (
      objectDataServices.Time.now().seconds > route.endTime.seconds ||
      route.ended.at ||
      route.terminated.at
    ) {
      backendServices.data.deadlineExceeded({
        message: "The route had ended.",
      });
    }

    //Data Correction
    route = { ...route.d, ...route };
    delete route["d"];
    data = { ...data, user, route, userIds: [uid] };

    //Data Processing
    const objectData = object.attributes(data);

    //Output
    const result = await objectDataServices.create({
      objectName,
      objectData,
      createdByUid: uid,
    });

    objectId = result.objectId;

    const objectIds = [objectId];
    const subjectObjectRelation = subject.relation.route.create.routeTicket.toUser({
      subjectName,
      subjectIds,
      directObjectName,
      directObjectIds,
    });

    await objectDataServices.createRelation({
      subjectName,
      subjectIds,
      objectName,
      objectIds,
      directObjectName,
      directObjectIds,
      subjectObjectRelation,
    });

    return httpUtils.successResponse({
      objectName,
      ids: [objectId],
      action: event,
      message: `Created ${objectName} successfully.`,
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
