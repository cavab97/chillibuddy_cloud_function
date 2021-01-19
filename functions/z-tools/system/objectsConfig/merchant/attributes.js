export default function attributes({
  id = null,
  businessName = null,
  businessRegistrationNumber = null,
  email = null,
  logo = [null],
  images = [null],
  phoneNumber = null,
  address = { 
    line1: null,
    line2: null,
    postcode: null,
    state: null,
    country: null
  },
  shops = [null],
  superadmin = [null],
  admins = [null],
  categories = [null],
  dateJoined = new Date,
  created = { at: null, by: null },
  deleted = { at: null, by: null },
  updated = { at: null, by: null },
}) {
  const packaging = {
    id,
    businessName,
    businessRegistrationNumber,
    email,
    logo,
    images,
    phoneNumber,
    address,
    shops,
    superadmin,
    admins,
    categories,
    dateJoined,
    created,
    deleted,
    updated,
  };

  const shared = {
    ...packaging
  };

  const confidential = {
    ...shared
  };

  const receivableState = {
    id,
    businessName,
    businessRegistrationNumber,
    logo,
    images,
    email,
    phoneNumber,
    address,
    shops,
    superadmin,
    admins,
    categories,
  };

  const manualUpdatableState = {
    confidential: {
      businessName,
      businessRegistrationNumber,
      email,
      logo,
      images,
      phoneNumber,
      address,
      shops,
      superadmin,
      admins,
      categories,
    },
  };

  return { 
    packaging, 
    shared, 
    confidential, 
    receivableState,
    manualUpdatableState
  };
}
