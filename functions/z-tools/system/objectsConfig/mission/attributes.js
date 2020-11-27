import { dataServices as objectDataServices } from "../../../marslab-library-cloud-function/services/database";

export default function attributes({
  id = null,
  title = null,
  subtitle = null,
  description = null,
  images = [null],
  shopIds = [null],
  routeIds = [null],
  minSpend = 0,
  numberRouteTickets=0,
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
      title,
      subtitle,
      description,
      images,
      shopIds,
      routeIds,
      minSpend,
      shop,
      numberRouteTickets
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
    subtitle,
    description,
    images,
    shopIds,
    routeIds,
    minSpend,
  };

  const manualUpdatableState = {
    confidential: {
      ["d.id"]: id,
      ["d.title"]: title,
      ["d.subtitle"]: subtitle,
      ["d.description"]: description,
      ["d.images"]: images,
      ["d.minSpend"]: minSpend,
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
