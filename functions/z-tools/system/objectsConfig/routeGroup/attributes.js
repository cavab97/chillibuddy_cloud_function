import { shopDataServices } from "../../../services/database";

export default function attributes({
  id = null,
  title = null,
  subtitle = null,
  description = null,
  images = [null],
  totalRoutes = 0,
  pendingRoutes = 0,
  ongoingRoutes = 0,
  endRoutes = 0,
  address = {
    line1: null,
    line2: null,
    postcode: null,
    state: null,
    country: null,
  },
  created = { at: null, by: null },
  deleted = { at: null, by: null },
  updated = { at: null, by: null },
  l = shopDataServices.GeoPoint(0, 0),
  g = null,
}) {
  const packaging = {
    d: {
      title,
      subtitle,
      description,
      images,
      address,
      totalRoutes,
      pendingRoutes,
      ongoingRoutes,
      endRoutes,
    },
    id,
    created,
    deleted,
    updated,
    l,
    g,
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
    address,
    l,
    g,
  };

  const manualUpdatableState = {
    confidential: {
      ["d.title"]: title,
      ["d.subtitle"]: subtitle,
      ["d.description"]: description,
      ["d.images"]: images,
      ["d.address"]: address,
      l,
      g,
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
