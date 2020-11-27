export default function attributes({
  id = null,
  rank = 0,
  title = null,
  subtitle = null,
  description = null,
  images = [null],
  eventIds = [null],
  routeIds = [null],
  routeTicketIds=[null],
  userIds = [null],
  user ={},
  route={},
  event={},
  issued = { at: null, by: null },
  obtained = { at: null, by: null },
  claimed = { at: null, by: null },

  created = { at: null, by: null },
  deleted = { at: null, by: null },
  updated = { at: null, by: null },
}) {
  const packaging = {
    rank,
    title,
    subtitle,
    description,
    images,
    routeIds,
    routeTicketIds,
    eventIds,
    userIds,
    user,
    route,
    event,
    issued,
    obtained,
    claimed,
    id,
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
    rank,
    title,
    subtitle,
    description,
    images,
    routeIds,
    eventIds,
    userIds,
    routeTicketIds
  };

  const manualUpdatableState = {
    confidential: {
      title,
      subtitle,
      description,
      images,
    },
  };

  const assignObjectState = {
    confidential: {
      routeTicketIds,
      userIds,
      user,
      obtained,
      issued,
    },
  };

  const claimObjectState = {
    confidential: {
      claimed
    },
  };

  return {
    packaging,
    shared,
    confidential,
    receivableState,
    manualUpdatableState,
    assignObjectState,
    claimObjectState
  };
}
