export const shop = {
  create: {
    promotion: {
      asChild: ({ subjectName = null, subjectIds = null }) => {
        const relation = {
          [subjectName]: subjectIds,
        };
        return relation;
      },
    },
    shopPost: {
      asChild: ({ subjectName = null, subjectIds = null }) => {
        const relation = {
          [subjectName]: subjectIds,
        };
        return relation;
      },
    },
    voucher: {
      asChild: ({ subjectName = null, subjectIds = null }) => {
        const relation = {
          [subjectName]: subjectIds,
        };
        return relation;
      },
    },
    favourite: {
      toUser: ({
        subjectName = null,
        subjectIds = null,
        directObjectName = null,
        directObjectIds = null,
      }) => {
        const relation = {
          [subjectName]: subjectIds,
          [directObjectName]: directObjectIds,
        };
        return relation;
      },
    },
  },
};
