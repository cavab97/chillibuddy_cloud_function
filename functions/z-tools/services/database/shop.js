import { database } from "../../marslab-library-cloud-function/utils/helper";

const objectName = "shop";

export const GeoPoint = database.GeoPoint

export function create({ objectId = null, objectData = {}, createdByUid = null }) {
  return new Promise((resolve, reject) => {
    database
      .createObject({ objectName, objectId, objectData, createdByUid })
      .then(result => {
        return resolve(result);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function update({ objectId = null, objectData = {}, updatedByUid = null }) {
  return new Promise((resolve, reject) => {
    database
      .updateObject({objectName, objectId, objectData, updatedByUid})
      .then(result => {
        return resolve(result);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function remove({ objectId = null, deletedByUid = null, additionUpdate = null }) {
  return new Promise((resolve, reject) => {
    database
      .deleteObject({objectName, objectId, deletedByUid, additionUpdate})
      .then(result => {
        return resolve(result);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function restore({ objectId = null }) {
  return new Promise((resolve, reject) => {
    database
      .restoreObject({ objectName, objectId })
      .then(result => {
        return resolve(result);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function createRelation({
  subjectName = null,
  subjectIds = [],
  objectIds = [],
  directObjectName = null,
  directObjectIds = [],
  subjectObjectRelation = {}
}) {
  return new Promise((resolve, reject) => {
    database
      .createSubjectObjectRelation({
        subjectName,
        subjectIds,
        objectName,
        objectIds,
        directObjectName,
        directObjectIds,
        subjectObjectRelation
      })
      .then(result => {
        return resolve(result);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function fanOutToRelation({
  objectId = null,
  objectBeforeData = {},
  objectAfterData = {},
  objectAttributes = {},
  fanOutTargetObjectNames = []
}) {
  return new Promise((resolve, reject) => {

    database
      .fanOutObject({
        objectName,
        objectId,
        objectBeforeData,
        objectAfterData,
        objectAttributes,
        fanOutTargetObjectNames
      })
      .then(result => {
        return resolve(result);
      })
      .catch(error => {
        reject(error);
      });
  });
}
