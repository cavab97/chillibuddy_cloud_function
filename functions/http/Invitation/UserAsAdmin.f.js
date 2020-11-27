import * as functions from "firebase-functions";
import { system, invitation } from "../../z-tools/marslab-library-cloud-function/system/objectsConfig";
import * as authService from "../../z-tools/marslab-library-cloud-function/services/auth";
import { invitationDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "system";
const event = "Invite As Admin";
let objectId = null;

export default functions.https.onCall(async (data, context) => {
  try {

    //Validate Permission
    const uid = context.auth.uid;
    if (!uid) {
      throw new Object({code: httpUtils.FunctionsErrorCode.unauthenticated, message: "Authenticated needed."}) 
    }

    const sender = await authService.getUserByUid({uid});

    if (!sender.customClaims.role.admin) {
      throw new Object({code: httpUtils.FunctionsErrorCode.permissionDenied, message: "Insufficient permission to perform the action."}) 
    }

    //Validate Data
    const { receiverEmail } = data;

    //Pre-condition Data Fetching
    const receiver = await authService.getUserByEmail({email:receiverEmail}).catch(error=>{
      throw new Object({code: httpUtils.FunctionsErrorCode.notFound, message: "User not found."}) 
    })

    const receiverUid = receiver.uid;

    //Data Processing
    const title = "Team Invitation";
    const subjectName = "system";
    const subjectIds = ["management"];
    const directObjectName = "user";
    const directObjectIds = [receiverUid];

    const subjectObjectRelation = system.relation.system.invite.user.asAdmin({
      subjectName,
      subjectIds,
      directObjectName,
      directObjectIds,
    });

    const type = "system";
    const action = "inviteAsAdmin";

    const invitationData = invitation.attributes({
      title,
      type,
      action,
      subjectName,
      subjectIds,
      directObjectName,
      directObjectIds
    });

    //Output
    const object  = await invitationDataServices.create({
      objectData: invitationData,
      createdByUid: uid
    });

    objectId = object.objectId

    const objectIds = [objectId];

    await invitationDataServices.createRelation({
      subjectName,
      subjectIds,
      objectIds,
      directObjectName,
      directObjectIds,
      subjectObjectRelation
    });

    return httpUtils.successResponse({
      objectName,
      ids: [objectId],
      action: event,
      message: `System send invitation as admin to user ${receiverUid} successfully.`
    });
  } catch (error) {
    const { code, message } = error

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
