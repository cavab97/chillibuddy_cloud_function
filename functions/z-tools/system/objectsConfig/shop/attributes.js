import { shopDataServices } from "../../../services/database"

export default function attributes({
  id = null,
  title = null,
  displayTitle = null,
  subtitle = null,
  description = null,
  logo = [null],
  images = [null],
  facebookUrl = null,
  instagramUrl = null,
  websiteUrl = null,
  whatsapp = null,
  phoneNumber = null,
  email = null,
  address = { 
    line1: null,
    line2: null,
    postcode: null,
    state: null,
    country: null
  },
  operatingHour = [{ day: null, open: null, close: null, operate: false }],
  totalMissions = 0, 
  merchants = [null],
  manager = [null],
  supervisor = [null],
  worker = [null],
  tags = [null],
  categories = [null],
  isPromote = false,
  dateJoined = new Date,
  created = { at: null, by: null },
  deleted = { at: null, by: null },
  updated = { at: null, by: null },
  l = shopDataServices.GeoPoint(0,0),
  g = null
}) {
  const packaging = {
    d:{
      title,
      displayTitle,
      subtitle,
      description,
      logo,
      images,
      facebookUrl,
      instagramUrl,
      whatsapp,
      websiteUrl,
      phoneNumber,
      email,
      address,
      operatingHour,
      merchants,
      manager,
      supervisor,
      worker,
      tags,
      categories,
      isPromote,
      dateJoined,
      totalMissions,
      deleted,
    },
    id,
    created,
    deleted,
    updated,
    l,
    g
  };

  const shared = {
    ...packaging
  };

  const confidential = {
    ...shared
  };

  const initialState = {
    id,
    title,
    displayTitle,
    subtitle,
    description,
    logo,
    images,
    facebookUrl,
    instagramUrl ,
    websiteUrl,
    whatsapp,
    phoneNumber,
    email ,
    address,
    operatingHour,
    merchants ,
    manager,
    supervisor,
    worker,
    tags,
    categories,
    isPromote,
    dateJoined,
    totalMissions,
    created,
    deleted,
    updated,
    l,
    g
  }

  return { packaging, shared, confidential, initialState };
}
