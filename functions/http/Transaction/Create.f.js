import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { transaction as object, user as subject } from "../../z-tools/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "transaction";
const relatedPartyNames = ["user", "route", "routeTicket", "mission", "shop"];
const event = "Create";
let objectId = null;

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

    if (data.payment.paymentType !== "cash")
      backendServices.data.invalidArgument({
        message: "The payment type have to be cash for currently",
      });

    if (
      //!data.payment.amount ||
      !data.payment.receiptPhotoUrl
    )
      backendServices.data.invalidArgument({
        message: "Amount & resit is needed.",
      });

    let relatedParties = relatedPartyNames.map((partyName) => {
      const idKey = `${partyName}Ids`;

      return {
        partyName,
        partyIds: partyName === "user" ? [uid] : data[idKey],
        partyId: partyName === "user" ? uid : data[idKey][0],
        partyData: null,
      };
    });

    //Read other object
    const readPromise = [];

    relatedParties.forEach((party) => {
      const { partyName, partyIds } = party;
      readPromise.push(
        objectDataServices.read({
          objectName: partyName,
          objectIds: partyIds,
          dataCategory: "Packaging0",
        })
      );
    });

    readPromise.push(
      objectDataServices.readRelatedObjects({
        subjectName: relatedParties[2].partyName,
        subjectIds: relatedParties[2].partyIds,
        objectName,
        directObjectName: relatedParties[3].partyName,
        directObjectIds: relatedParties[3].partyIds,
      })
    );

    const readObjects = await Promise.all(readPromise);

    //Data correction and verification
    const relatedObject = readObjects.pop();

    readObjects.forEach((result, index) => {
      const { partyName } = relatedParties[index];
      if ((result && result.length === 0) || !result[0]) {
        backendServices.data.objectNotExist({
          message: `The ${partyName} not exist.`,
        });
      }
      relatedParties[index].partyData = result[0];
      data = { ...data, [partyName]: result[0] };
    });

    const route = relatedParties[1];
    const routeTicket = relatedParties[2];
    const mission = relatedParties[3];
    const shop = relatedParties[4];
    const isExisted = relatedObject[0][0];

    if (isExisted) {
      backendServices.data.objectExist({
        message: "This mission completed before.",
      });
    }

    if (!route.partyData.ongoing.boolean) {
      backendServices.data.unavailable({
        message: "The Route not yet available",
      });
    }

    if (route.partyData.terminated.boolean) {
      backendServices.data.deadlineExceeded({
        message: "The Route had terminated",
      });
    }

    if (route.partyData.ended.boolean) {
      backendServices.data.deadlineExceeded({
        message: "The Route had ended",
      });
    }

    if (routeTicket.partyData.userIds[0] !== uid)
      backendServices.data.invalidArgument({
        message: "The Ticket not belong to you.",
      });

    if (routeTicket.partyData.routeIds[0] !== route.partyData.id)
      backendServices.data.invalidArgument({
        message: "The route ticket not belong to route.",
      });

    if (mission.partyData.d.routeIds[0] !== route.partyData.id)
      backendServices.data.invalidArgument({
        message: "The mission not belong to route.",
      });

    if (mission.partyData.d.minSpend > data.payment.amount)
      backendServices.data.invalidArgument({
        message: "Payment amount must higher than minSpend to completed this mission.",
      });

    if (mission.partyData.d.shopIds[0] !== shop.partyData.id)
      backendServices.data.invalidArgument({
        message: "The mission not belong to shop.",
      });

    //Data Processing
    const objectData = object.attributes(data);

    const subjectObjectRelation = subject.relation.user.create.transaction.toJoin({
      relatedParties,
    });

    //Output
    const result = await objectDataServices.createWithRelation({
      objectName,
      objectData,
      createdByUid: uid,
      relatedParties,
      subjectObjectRelation,
    });

    objectId = result.objectId;

    return httpUtils.successResponse({
      objectName,
      ids: [objectId],
      action: event,
      //message: `Created ${objectName} successfully.`,
      message: `Submitted successfully.`,
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
