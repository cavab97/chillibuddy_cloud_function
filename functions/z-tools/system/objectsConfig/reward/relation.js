export const reward = {
    create: {
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