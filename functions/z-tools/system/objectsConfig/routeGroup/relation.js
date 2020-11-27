export const routeGroup = {
    create: {
      route: {
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