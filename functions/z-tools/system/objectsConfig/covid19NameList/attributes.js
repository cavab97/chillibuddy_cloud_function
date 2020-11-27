export default function attributes({
    id = null,
    name = null,
    phoneNumber = null,
    identityNumber = null,
    temperature = 0,
    date = new Date,

    userIds = [null],
    user = { },

    created = { at: null, by: null },
    deleted = { at: null, by: null },
    updated = { at: null, by: null },
  }) {
    const packaging = {
        id,
        name,
        phoneNumber,
        identityNumber,
        temperature,
        date,
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
        name,
        phoneNumber,
        identityNumber,
        temperature,
        userIds,
        date,
    };
  
    return {
      packaging,
      shared,
      confidential,
      receivableState,
    };
  }
  