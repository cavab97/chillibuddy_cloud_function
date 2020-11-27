export default function attributes({
    id = null,
    businessName = null,
    ssmNumber = null,
    referral = null,
    address = {
      line1: null,
      line2: null,
      postcode: null,
      city: null,
      state: null,
      country: null
    },

    userIds = [null],
    user = { },

    created = { at: null, by: null },
    deleted = { at: null, by: null },
    updated = { at: null, by: null },
  }) {
    const packaging = {
        id,
        businessName,
        ssmNumber,
        referral,
        address,
        userIds,
        user,

        created,
        deleted,
        updated,
    };
  
    const shared = {
      ...packaging,
    };
  
    const confidential = {
      ...shared,
    };
  
    const receivableState = {
      id,
      businessName,
      ssmNumber,
      referral,
      address,
      userIds,
    };
  
    const manualUpdatableState = {
      confidential: {
        businessName,
        ssmNumber,
        referral,
        address,
      },
    }

    return {
      packaging,
      shared,
      confidential,
      receivableState,
      manualUpdatableState
    };
  }
  