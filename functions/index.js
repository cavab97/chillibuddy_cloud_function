const loadFunctions = require("firebase-function-tools");
const admin = require("firebase-admin");
const { firebaseConfig, serviceAccount } = require("./z-tools/settings/api/config");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  ...firebaseConfig,
});

loadFunctions(__dirname, exports);
