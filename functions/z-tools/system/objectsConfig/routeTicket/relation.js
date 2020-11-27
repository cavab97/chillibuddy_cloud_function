export const routeTicket = {
    obtained: {
      reward: {
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
      }
    }
  };