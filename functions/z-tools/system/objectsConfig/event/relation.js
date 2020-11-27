export const event = {
  create: {
    reward: {
      asChild: ({ subjectName = null, subjectIds = null }) => {
        const relation = {
          [subjectName]: subjectIds,
        };
        return relation;
      },
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
  },
};
