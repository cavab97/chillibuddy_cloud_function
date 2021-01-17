export default function attributes({
  id = null,
  name = null,
  businessRegistrationNumber = null,
  email = null,
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
  admins = null,
  categories = [null],
  dateJoined = new Date,
  created = { at: null, by: null },
  deleted = { at: null, by: null },
  updated = { at: null, by: null },
}) {
  const packaging = {
    id,
    name,
    businessRegistrationNumber,
    email,
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
    name,
    businessRegistrationNumber,
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
      name,
      businessRegistrationNumber,
      email,
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
