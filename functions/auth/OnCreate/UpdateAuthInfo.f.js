import * as functions from "firebase-functions";
import { setCustomUserClaims } from "../../z-tools/marslab-library-cloud-function/services/auth"
import { roleClaims, planClaims } from "../../z-tools/marslab-library-cloud-function/system/customClaimsConfig"

export default functions.region("asia-east2").auth.user().onCreate((uRecord, context) => {
  const user = uRecord;
  const { uid, email } = user;

  const customClaims = {...roleClaims.user, ...planClaims.noSubscribedToAnyPlan}

  // Set custom user claims on this newly created user.
  return setCustomUserClaims({uid, customClaims})
    .then(() => {
      console.log(email + " set to " + JSON.stringify(customClaims));
      return;
    })
    .catch(error => {
      console.error(error);
      return;
    });
});
