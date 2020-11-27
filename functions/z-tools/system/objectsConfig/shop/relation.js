export const shop = {
    create: {
      promotion: {
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
      shopPost: {
        asChild: ({
          subjectName = null,
          subjectIds = null
        }) => {
          const relation = {
            [subjectName] : subjectIds
          };
          return relation;
        }
      }
      
    }
  };