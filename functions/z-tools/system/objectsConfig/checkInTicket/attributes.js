export default function attributes({
  id = null,
  numberCheckIn = 0,
  checkIns = [null],
  month = null,
  year = null,
  userIds = [null],
  user = {
    role: {
      absoluteDeveloper: false,
      developer: false,
      director: false,
      executive: false,
      admin: false,
      user: true,
    },
    accessLevel: 50,
    plan: null,
    disabled: false,
    displayName: null,
    name: { firstName: null, lastName: null },
    address: {
      line1: null,
      line2: null,
      postcode: null,
      state: null,
      country: null,
    },
    dateOfBirth: null,
    gender: null,
    username: null,
    email: null,
    emailVerified: false,
    identityNumber: null,
    phoneNumber: null,
    notificationToken: [],
    photoURL: null,
    providerId: null,
    lastLoginAt: null,
    created: { at: null, by: null },
    deleted: { at: null, by: null },
    updated: { at: null, by: null },
    id: null,
  },
  voucherIds = [null],
  voucher = {},
  created = { at: null, by: null },
  deleted = { at: null, by: null },
  updated = { at: null, by: null },
}) {
  const packaging = {
    id,
    userIds,
    user,
    voucherIds,
    voucher,
    numberCheckIn,
    checkIns,
    month,
    year,
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
    checkIns,
    userIds,
  };

  const manualUpdatableState = {
    confidential: {
      ["checkIns"]: checkIns,
    },
  };

  return {
    packaging,
    shared,
    confidential,
    receivableState,
    manualUpdatableState,
  };
}
