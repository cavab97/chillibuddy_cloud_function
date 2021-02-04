import { dataServices as objectDataServices } from "../../../marslab-library-cloud-function/services/database";

export default function attributes({
  id = null,
  isFavourite = false,
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
  created = { at: null, by: null },
  deleted = { at: null, by: null },
  updated = { at: null, by: null },
}) {
  const packaging = {
    id,
    d: { isFavourite, userIds, user, shopIds, shop, deleted },
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
    isFavourite,
    userIds,
    shopIds,
  };

  const manualUpdatableState = {
    confidential: {
      ["d.isFavourite"]: isFavourite,
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
