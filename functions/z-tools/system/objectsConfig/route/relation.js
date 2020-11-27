export const route = {
    create: {
      reward: { 
        asChild: ({
          subjectName = null,
          subjectIds = null
        }) => {
          const relation = {
            [subjectName] : subjectIds
          };
          return relation;
        }
      },
      mission: {
        toShop: ({
          subjectName = null,
          subjectIds = null,
          directObjectName = null,
          directObjectIds = null
        }) => {
          const relation = {
            [subjectName] : subjectIds,
            [directObjectName] : directObjectIds
          };
          return relation;
        }
      },
      routeTicket: {
        toUser: ({
          subjectName = null,
          subjectIds = null,
          directObjectName = null,
          directObjectIds = null
        }) => {
          const relation = {
            [subjectName] : subjectIds,
            [directObjectName] : directObjectIds
          };
          return relation;
        }
      },
      notification: {
        toUser: ({
          objectName = null,
          objectIds = null
        }) => {
          const relation = {
            [objectName] : objectIds,
          };
          return relation;
        },
      },
    }
  };