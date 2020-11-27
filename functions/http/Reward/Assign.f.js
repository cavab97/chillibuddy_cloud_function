import * as functions from "firebase-functions";
import * as backendServices from "../../z-tools/marslab-library-cloud-function/services/backend";
import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";
import { 
  reward as object,
  route,
  event,
} from "../../z-tools/system/objectsConfig";

import * as httpUtils from "../../z-tools/marslab-library-cloud-function/utils/http";

const objectName = "reward";
let subject = {};
let subjectName = null;
let subjectIds = [];
const eventAction = "Assign";
let objectId = null;

export default functions.https.onCall(async (data, context) => {
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

    //read other object
    const readRewards = objectDataServices.read({
      objectName,
      objectIds: [data.id],
      dataCategory: "Private0",
    });

    const readUsers = objectDataServices.read({
      objectName: "user",
      objectIds: data.userIds,
      dataCategory: "Private0",
    });

    const readSubject = objectDataServices.read({
      objectName: subjectName,
      objectIds: subjectIds,
      dataCategory: "Packaging0",
    });

    const readRouteTicket = objectDataServices.read({
      objectName: "routeTicket",
      objectIds: data.routeTicketIds,
      dataCategory: "Private0",
    });

    const readPromise = await Promise.all([readRewards, readUsers, readSubject, readRouteTicket]);

    const reward = readPromise[0][0];
    const user = readPromise[1][0];
    const subjectData = readPromise[2][0];
    const routeTicket = readPromise[3][0];

    //validation
    if(!reward){
      backendServices.data.objectNotExist({message:"Reward not found."})
    }

    if(!user){
      backendServices.data.objectNotExist({message:"Winner not found."})
    }

    if(reward.obtained.at){
      backendServices.data.objectExhausted({message:"The reward is belong to someone."})
    }

    if(!subjectData.published.at){
      backendServices.data.unavailable({message:`Can't assign reward before ${subjectName} published.`});
    }

    if(subjectData.endTime > objectDataServices.Time.now()){
      backendServices.data.unavailable({message:`Can't assign reward before ${subjectName} ended.`});
    }

    if(subjectData.terminated.at){
      backendServices.data.unavailable({message:`Can't assign reward after ${subjectName} terminated.`});
    }

    if(subjectName === "route"){
      if(routeTicket.reward.id){
        backendServices.data.unavailable({message:`This user has been assigned a reward.`});
      }

      if(subjectData.assignCompleted){
        backendServices.data.unavailable({message:`This route has been assign completed.`});
      }
    }

    let assignData = {};

    if(data.eventIds.length !== 0){
      assignData = {
        userIds: data.userIds,
        user,
        obtained:{
          at: objectDataServices.Time.now(),
          by: data.userIds[0]
        },
        issued: {
          at: objectDataServices.Time.now(),
          by: uid
        }
      }
    }

    if(data.routeIds.length !== 0){
      assignData = {
        userIds: data.userIds,
        user,
        obtained:{
          at: objectDataServices.Time.now(),
          by: data.userIds[0]
        },
        routeTicketIds: data.routeTicketIds,
      }
    }

    //object Correction
    data = {
      ...data,
      ...assignData
    };

    //Data Processing
    const objectData = object.attributes(data).assignObjectState;

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
      action: eventAction,
      message: `Update ${objectName} successfully.`,
    });
  } catch (error) {
    const { code, message } = error;

    console.log(error);

    httpUtils.failedResponse({
      code: code,
      objectName,
      ids: [objectId],
      action: eventAction,
      message: message,
    });
    return error;
  }
});
