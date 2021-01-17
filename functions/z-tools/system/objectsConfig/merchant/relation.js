export const merchant = {
  has: {
    shop: {
      asChild: ({ subjectName = null, subjectIds = null }) => {
        const relation = {
          [subjectName]: subjectIds,
        };
        return relation;
      },
    },
    user: {
      asChild: ({ subjectName = null, subjectIds = null }) => {
        const relation = {
          [subjectName]: subjectIds,
        };
        return relation;
      },
    },
  },
};
