import * as functions from "firebase-functions";

import { roleClaims } from "../../z-tools/marslab-library-cloud-function/system/customClaimsConfig";
import { system } from "../../z-tools/marslab-library-cloud-function/system/objectsConfig";

import {
  invitationDataServices,
  userDataServices,
  systemDataServices,
} from "../../z-tools/marslab-library-cloud-function/services/database";
import * as authServices from "../../z-tools/marslab-library-cloud-function/services/auth";
import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "Invitation";
const event = "Response to";

export default functions.https.onCall(async (data, context) => {
  console.log("userAsAdminResponse");
  try {
    const { objectIds = [], accepted = false, rejected = false } = data;
    const ids = objectIds;
    const uid = "RRHdliHQ53bZWHrBESxM9RHO6hl2";

    const actionPromises = [];
    const invitations = await invitationDataServices.readInvitations({ objectIds });
    const objectData = { accepted, rejected };
    const [
      { id = null, directObjectName = null, directObjectIds = [], type = null, action = null },
    ] = invitations;

    if (!accepted && !rejected) {
      throw httpUtils.failedResponse({
        objectName,
        ids,
        action: event,
        message: "Invalid Command.",
      });
    }

    if (rejected) {
      await invitationDataServices.update({
        objectId: id,
        objectData,
        updatedByUid: uid,
      });
      return httpUtils.successResponse({
        objectName,
        ids,
        action: event,
        message: "The Invitation Rejected.",
      });
    }

    switch (directObjectName) {
      case "user":
        if (!directObjectIds.includes(uid)) {
          throw httpUtils.failedResponse({
            objectName,
            ids,
            action: event,
            message: "No permission to perform the action.",
          });
        }
        switch (action) {
          case "invitiveAsAdmin":
            actionPromises.push(
              authServices.updateCustomUserClaims({
                uid,
                customClaims: roleClaims.admin,
              })
            );

            actionPromises.push(
              userDataServices.createRelation({
                subjectName: "system",
                subjectIds: ["management"],
                objectIds: [uid],
              })
            );

            actionPromises.push(
              userDataServices.update({
                objectId: uid,
                objectData: roleClaims.admin,
                updatedByUid: uid,
              })
            );

            actionPromises.push(
              systemDataServices.update({
                objectId: "management",
                objectArrayUnionData: system.relation.system.set.admin({ uid }),
                updatedByUid: uid,
              })
            );

            break;
          default:
            break;
        }
        break;
      default:
        break;
    }

    await Promise.all(actionPromises);
    await invitationDataServices.update({ objectId: id, objectData, updatedByUid: uid });

    return httpUtils.successResponse({
      objectName,
      ids,
      action: event,
      message: "The Invitation Accepted.",
    });
  } catch (error) {
    console.log(error);
    throw new functions.https.HttpsError(JSON.stringify(error));
  }
});
