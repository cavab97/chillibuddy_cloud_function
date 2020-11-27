export const user = {
  create: {
    transaction: {
      toJoin: ({
        relatedParties = [
          {
            partyName,
            partyIds: data[idKey],
            partyData: null,
          },
        ],
      }) => {
        let relation = {
          object: "shop",
          subject: "user",
          directObject: "mission",
        };

        relatedParties.forEach((party) => {
          const { partyName, partyIds } = party;
          relation = { ...relation, [partyName]: partyIds };
        });
        return relation;
      },
    },
  },
  obtained: {
    reward: {
      asChild: ({
        subjectName = null,
        subjectIds = null
      }) => {
        const relation = {
          [subjectName]: subjectIds
        };
        return relation;
      },
    },
  },
};
