import { dataServices as objectDataServices } from "../../../marslab-library-cloud-function/services/database";

export default function attributes({
  id = null,
  active = false,
  assigned = false,
  amount = null,
  title = null,
  description = null,
  tnc = null,
  usedDate = { at: null, by: null },
  shopIds = [null],
  shop = {
    id: null,
    title: null,
    displayTitle: null,
    subtitle: null,
    description: null,
    logo: [null],
    images: [null],
    facebookUrl: null,
    instagramUrl: null,
    websiteUrl: null,
    whatsapp: null,
    phoneNumber: null,
    email: null,
    address: {
      line1: null,
      line2: null,
      postcode: null,
      state: null,
      country: null,
    },
    operatingHour: [{ day: null, open: null, close: null, operate: false }],
    merchants: [null],
    manager: [null],
    supervisor: [null],
    worker: [null],
    tags: [null],
    categories: [null],
    isPromote: false,
    dateJoined: new Date(),
    created: { at: null, by: null },
    deleted: { at: null, by: null },
    updated: { at: null, by: null },
    l: objectDataServices.GeoPoint(0, 0),
    g: null,
  },
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
  prevUserIds = [null],
  prevUser = {
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
  assignedDate = { at: null, by: null },
  endDate = new Date(),
  prevAssignedDate = [null],
  created = { at: null, by: null },
  deleted = { at: null, by: null },
  updated = { at: null, by: null },
}) {
  const packaging = {
    id,
    d: {
      active,
      assigned,
      amount,
      usedDate,
      title,
      description,
      tnc,
      userIds,
      user,
      prevUserIds,
      prevUser,
      shopIds,
      shop,
      assignedDate,
      endDate,
      prevAssignedDate,
    },
    l: shop.l,
    g: shop.g,
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
    active,
    assigned,
    amount,
    usedDate,
    title,
    description,
    tnc,
    userIds,
    prevUserIds,
    shopIds,
    assignedDate,
    endDate,
    prevAssignedDate,
  };

  const manualUpdatableState = {
    confidential: {
      ["d.amount"]: amount,
      ["d.description"]: description,
      ["d.tnc"]: tnc,
      ["d.title"]: title,
    },
  };

  const assignObjectState = {
    confidential: {
      userIds,
      user,
      assigned,
      assignedDate,
      endDate,
    },
  };

  const claimObjectState = {
    confidential: {
      usedDate,
    },
  };
  return {
    packaging,
    shared,
    confidential,
    receivableState,
    manualUpdatableState,
    assignObjectState,
    claimObjectState,
  };
}
