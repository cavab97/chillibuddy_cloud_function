import { dataServices as objectDataServices } from "../../../marslab-library-cloud-function/services/database";

export default function attributes({
  id = null,
  title = null,
  description = null,
  startTime = new Date(),
  endTime = new Date(),
  started = { at: null, by: null, boolean: false },
  ended = { at: null, by: null, boolean: false },
  coverPhoto = [null],
  images = [null],
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
    d: {
      coverPhoto,
      startTime,
      endTime,
      started,
      ended,
      title,
      description,
      images,
      shopIds,
      shop
    },
    l: shop.l,
    g: shop.g,
    created,
    deleted,
    updated,
    id,
  };

  const shared = {
    ...packaging,
  };

  const confidential = {
    ...shared,
  };

  const receivableState = {
    id,
    title,
    description,
    coverPhoto,
    images,
    shopIds,
    startTime,
    endTime,
  };

  const manualUpdatableState = {
    confidential: {
      ["d.title"]: title,
      ["d.description"]: description,
      ["d.coverPhoto"]: coverPhoto,
      ["d.images"]: images,
      ["d.startTime"]: startTime,
      ["d.endTime"]: endTime
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
