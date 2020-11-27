export default function attributes({
  id = null,
  type = null,
  title = null,
  subtitle = null,
  description = null,
  images = [null],
  rules = null,
  terms = null,
  winner = { at: null, by: null, displayName: null, prizeTitle: null },
  published = { at: null, by: null, boolean:false },
  terminated = { at: null, by: null, boolean:false  },
  startTime = new Date(),
  endTime = new Date(),
  assignedRewards = 0,
  totalRewards = 0,
  created = { at: null, by: null },
  deleted = { at: null, by: null },
  updated = { at: null, by: null },
}) {
  const packaging = {
    title,
    type,
    subtitle,
    description,
    images,
    rules,
    terms,
    winner,
    published,
    terminated,
    startTime,
    endTime,
    assignedRewards,
    totalRewards,
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
    title,
    type,
    subtitle,
    description,
    images,
    rules,
    terms,
    startTime,
    endTime,
  };

  const manualUpdatableState = {
    confidential: {
      title,
      type,
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
    },
  };
  const terminateObjectState = {
    confidential: {
      terminated
    },
  };

  return {
    packaging,
    shared,
    confidential,
    receivableState,
    manualUpdatableState,
    publishObjectState,
    terminateObjectState
  };
}
