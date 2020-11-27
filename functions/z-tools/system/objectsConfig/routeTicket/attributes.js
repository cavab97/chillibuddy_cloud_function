export default function attributes({
  id = null,
  invited = { at: null, by: null },
  sharedFb = { at: null, by: null },
  routeIds = [null],
  route = {
    title : null,
    type : null,
    subtitle : null,
    description : null,
    images : [null],
    rules : null,
    terms : null,
    published : { at: null, by: null },
    terminated : { at: null, by: null },
    pending : { at: null, by: null },
    ongoing : { at: null, by: null },
    ended : { at: null, by: null },
    startTime : new Date(),
    endTime : new Date(),
    currentUser : 0, 
    minimumUser : 0,
    totalMissions : 0,
    id : null ,
    routeGroupId : [null],
    created : { at: null, by: null },
    deleted : { at: null, by: null },
    updated : { at: null, by: null },
  },
  userIds = [null],
  user = {
    role : {
      absoluteDeveloper: false,
      developer: false,
      director: false,
      executive: false,
      admin: false,
      user: true
    },
    accessLevel : 50,
    plan : null,
    disabled : false,
    displayName : null,
    name : { firstName: null, lastName: null },
    address : {
      line1: null,
      line2: null,
      postcode: null,
      state: null,
      country: null
    },
    dateOfBirth : null,
    gender : null,
    username : null,
    email : null,
    emailVerified : false,
    identityNumber : null,
    phoneNumber : null,
    notificationToken : [],
    photoURL : null,
    providerId : null,
    lastLoginAt : null,
    created : { at: null, by: null },
    deleted : { at: null, by: null },
    updated : { at: null, by: null },
    id : null
  },
  rewardIds = [null],
  reward= {},
  numberApprovedMission=0,
  numberCompletedMissions = 0,
  completedMissions =[],
  verify=false,
  created = { at: null, by: null },
  deleted = { at: null, by: null },
  updated = { at: null, by: null },
}) {
  const packaging = {
    invited,
    sharedFb,
    routeIds,
    route,
    userIds,
    user,
    rewardIds,
    reward,
    numberApprovedMission,
    numberCompletedMissions,
    completedMissions,
    verify,
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
    routeIds,
    verify
  }

  const verifyObjectState = {
    confidential: {
      verify
    },
  };

  return {
    packaging,
    shared,
    confidential,
    receivableState,
    verifyObjectState
  };
}
