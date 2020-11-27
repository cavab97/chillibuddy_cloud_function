export default function attributes({
  id = null,
  shopIds = [null],
  userIds = [null],
  routeTicketIds = [null],
  routeIds = [null],
  missionIds = [null],
  payment = {
    paymentType: null,
    paymentId: null,
    receiptId: null,
    amount: 0,
    receiptPhotoUrl: null,
    receiptUrl: null,
  },
  routeTicket = {},
  mission = {},
  shop = {},
  user = {},
  route = {},
  approved = { at: null, by: null },
  rejected = { at: null, by: null },

  created = { at: null, by: null },
  deleted = { at: null, by: null },
  updated = { at: null, by: null },
}) {
  const packaging = {
    id,
    shopIds,
    userIds,
    routeTicketIds,
    missionIds,
    payment,
    routeTicket,
    route,
    mission,
    shop,
    user,
    paymentType : payment.paymentType,
    paymentId :payment.paymentId,
    approved,
    rejected,

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
    shopIds,
    routeTicketIds,
    routeIds,
    missionIds,
    payment,
  };

  const approveObjectState = {
    confidential: {
      approved,
    },
  };

  const rejectObjectState = {
    confidential: {
      rejected,
    },
  };

  return {
    packaging,
    shared,
    confidential,
    receivableState,
    approveObjectState,
    rejectObjectState
  };
}
