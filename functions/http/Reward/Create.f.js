import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { reward as object, route, event } from "../../z-tools/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "reward";
let subject = {};
let subjectName = null;
let subjectIds = [];
const eventAction = "Create";
let objectIds = null;
let objectQty = null;

export default functions.https.onCall(async (data, context) => {
  console.log("create");
  try {
    //Validate Permission
    const uid = context.auth.uid;
    await backendServices.permission.identityChecking({ uid, role: "admin" });

    if (data.routeIds.length !== 0) {
      subject = route;
      subjectName = "route";
      subjectIds = data.routeIds;
    } else {
      subject = event;
      subjectName = "event";
      subjectIds = data.eventIds;
    }

    if (subjectIds.length === 0) {
      backendServices.data.objectNotExist({
        message: "Route id or event id required.",
      });
    }

    if (!Number.isInteger(data.rank)) {
      backendServices.data.invalidArgument({
        message: "Rank have to be number without decimal point.",
      });
    }

    if (data.quantity > 70) {
      backendServices.data.invalidArgument({
        message: "Reward quantity cannot more than 70.",
      });
    }

    objectQty = data.quantity;
    delete data["quantity"];

    //Data Correction
    data = {
      ...data,
    };

    //Validate Data
    const referenceData = object.attributes({});
    backendServices.data.validation({
      target: data,
      reference: referenceData.receivableState,
    });

    //Read other object
    const readSubject = objectDataServices.read({
      objectName: subjectName,
      objectIds: subjectIds,
      dataCategory: "Packaging0",
    });

    const readExist = objectDataServices.db
      .collection(`${subjectName}Packaging0/${subjectIds[0]}/rewardPackaging0`)
      .where("deleted.by", "==", null)
      .where("rank", "==", data.rank)
      .get();

    const readPromise = await Promise.all([readSubject, readExist]);

    const subjectData = readPromise[0];
    const rankExisted = readPromise[1];

    //validate
    if (rankExisted.docs[0] && rankExisted.docs[0].exists) {
      backendServices.data.objectExist({
        message: "Reward for the rank already existed.",
      });
    }

    if (subjectData[0].published.boolean) {
      backendServices.data.unavailable({
        message: `Can't add new reward after the ${subjectName} published.`,
      });
    }

    const objectsArray = [];

    for (let i = 0; i < objectQty; i++) {
      //Data Processing
      const objectData = object.attributes({ ...data, [subjectName]: subjectData });

      const subjectObjectRelation = subject.relation[subjectName].create.reward.asChild({
        subjectName,
        subjectIds,
      });

      objectsArray.push({
        packaging: objectData.packaging,
        shared: objectData.shared,
        confidential: objectData.confidential,
        subjectObjectRelation,
      });

      data.rank++;
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
          partyData: subjectData[0],
        },
      ],
    });

    objectIds = result.objectIds;

    return httpUtils.successResponse({
      objectName,
      ids: objectIds,
      action: eventAction,
      message: `Created ${objectName} successfully.`,
    });
  } catch (error) {
    const { code, message } = error;

    console.log(error);

    httpUtils.failedResponse({
      code: code,
      objectName,
      ids: [objectIds],
      action: eventAction,
      message: message,
    });
    return error;
  }
});
