export const merchant = {
  create: {
    voucher: {
      asChild: ({ 
        subjectName = null, 
        subjectIds = null 
      }) => {
        const relation = {
          [subjectName]: subjectIds,
        };
        return relation;
      },
    },
  },
};
