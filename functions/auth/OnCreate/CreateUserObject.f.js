import * as functions from "firebase-functions";
import { user } from "../../z-tools/marslab-library-cloud-function/system/objectsConfig";
import { userDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";

export default functions
  .region("asia-east2")
  .auth.user()
  .onCreate((uRecord, context) => {
    // User Information
    const userRecord = uRecord || {};
    const email = userRecord.email ? userRecord.email : null; // The email of the user.
    const photoURL = userRecord.photoURL
      ? userRecord.photoURL
      : userRecord.providerData[0].photoURL
      ? userRecord.providerData[0].photoURL
      : null;
    const displayName = userRecord.displayName ? userRecord.displayName : null; // The display name of the user.
    const phoneNumber = userRecord.phoneNumber ? userRecord.phoneNumber : null;
    const uid = userRecord.uid;
    const shopIds = userRecord.shopIds ? userRecord.shopIds : null;

    const provider =
      userRecord.providerData !== []
        ? userRecord.providerData[0]
        : { providerId: email ? "password" : "phone" };

    const providerId = provider.providerId
      ? provider.providerId.replace(".com", "")
      : provider.providerId;

    const userData = user.attributes({
      email,
      photoURL,
      displayName,
      phoneNumber,
      uid,
      shopIds,
    });

    return userDataServices
      .create({ objectId: uid, objectData: userData })
      .then((result) => {
        return console.log("Object " + uid + " created successfully. " + result);
      })
      .catch((error) => {
        return console.error(error);
      });
  });
