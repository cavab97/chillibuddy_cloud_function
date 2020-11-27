export default function attributes({
  id = null,
  type = null,
  category = null, //new
  title = null,
  subtitle = null,
  description = null,
  images = [null],
  rules = null,
  terms = null,
  winner = { at: null, by: null, displayName: null, prizeTitle: null },
  published = { at: null, by: null, boolean: false },
  terminated = { at: null, by: null, boolean: false },
  pending = { at: null, by: null, boolean: false },
  ongoing = { at: null, by: null, boolean: false },
  ended = { at: null, by: null, boolean: false },
  startTime = new Date(),
  endTime = new Date(),
  currentUser = 0,
  minimumUser = 0,
  assignedRewards = 0,
  station = 0,
  totalRewards = 0,
  totalMissions = 0,
  assignCompleted = false,
  routeGroupId = [null],
  created = { at: null, by: null },
  deleted = { at: null, by: null },
  updated = { at: null, by: null },
}) {
  const packaging = {
    title,
    type,
    category, //new
    subtitle,
    description,
    images,
    rules,
    terms,
    winner,
    published,
    terminated,
    pending,
    ongoing,
    ended,
    startTime,
    endTime,
    currentUser,
    minimumUser,
    assignedRewards,
    totalRewards,
    totalMissions,
    assignCompleted,
    id,
    routeGroupId,
    created,
    deleted,
    updated,
    station
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
    type,
    category,
    subtitle,
    description,
    images,
    rules,
    terms,
    startTime,
    endTime,
    minimumUser,
    routeGroupId,
    station,
    assignCompleted
  };

  const manualUpdatableState = {
    confidential: {
      title,
      subtitle,
      description,
      images,
      rules,
      terms,
      startTime,
      endTime,
    },
  };

  const publishObjectState = {
    confidential: {
      published,
      pending,
      ongoing,
    },
  };
  const terminateObjectState = {
    confidential: {
      terminated
    },
  };

  const assignCompleteObjectState = {
    confidential: {
      assignCompleted
    },
  };

  return {
    packaging,
    shared,
    confidential,
    receivableState,
    manualUpdatableState,
    publishObjectState,
    terminateObjectState,
    assignCompleteObjectState
  };
}
