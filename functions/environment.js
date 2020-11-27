/*****************************
 * environment.js
 * path: '/environment.js' (root of your project)
 ******************************/

const serviceAccountDev = require("./z-serviceAccount/ServiceAccount-dev.json");
const serviceAccountStaging = require("./z-serviceAccount/ServiceAccount-staging.json");
const serviceAccountProd = require("./z-serviceAccount/ServiceAccount-prod.json");

const ENV = {
  dev: {
    //    apiUrl: localhost,
    //    amplitudeApiKey: null,
    FIREBASE_API_KEY: "AIzaSyDKmyewOf5zdgVYrgg0u44SMFEcyrmvKmA",
    FIREBASE_AUTH_DOMAIN: "gogogain-dev.firebaseapp.com",
    FIREBASE_DATABASE_URL: "https://gogogain-dev.firebaseio.com/",
    FIREBASE_PROJECT_ID: "gogogain-dev",
    FIREBASE_STORAGE_BUCKET: "gs://gogogain-dev.appspot.com/",
    FIREBASE_MESSAGING_SENDER_ID: "473612187597",
    FIREBASE_APP_ID: "1:473612187597:web:a0c8fbf04dd2a50896b684",
    FIREBASE_MEASUREMENT_ID: "G-NDXKRNBEJH"
    // Add other keys you want here
  },
  staging: {
    //    apiUrl: "[your.staging.api.here]",
    //    amplitudeApiKey: "[Enter your key here]",
    FIREBASE_API_KEY: "AIzaSyCANZCZHh4q42J8NM2kWWBp0be6OdlPhRI",
    FIREBASE_AUTH_DOMAIN: "gogogain-stanging.firebaseapp.com",
    FIREBASE_DATABASE_URL:
      "https://gogogain-stanging.firebaseio.com/",
    FIREBASE_PROJECT_ID: "gogogain-stanging",
    FIREBASE_STORAGE_BUCKET: "gs://gogogain-stanging.appspot.com/",
    FIREBASE_MESSAGING_SENDER_ID: "1042206429903",
    FIREBASE_APP_ID: "1:1042206429903:web:7c5b79475e8320bd965dba",
    FIREBASE_MEASUREMENT_ID: "G-YELZTFQ3MG"
    // Add other keys you want here
  },
  prod: {
    //    apiUrl: "[your.production.api.here]",
    //    amplitudeApiKey: "[Enter your key here]",
    FIREBASE_API_KEY: "AIzaSyAo-D7vn70nwtBfFJTQWaJdkJEVR-9b-iY",
    FIREBASE_AUTH_DOMAIN: "gogogain-gogogain.firebaseapp.com",
    FIREBASE_DATABASE_URL: "https://gogogain-gogogain.firebaseio.com/",
    FIREBASE_PROJECT_ID: "gogogain-gogogain",
    FIREBASE_STORAGE_BUCKET: "gs://gogogain-gogogain.appspot.com/",
    FIREBASE_MESSAGING_SENDER_ID: "431448808009",
    FIREBASE_APP_ID: "1:431448808009:web:1b2ec0836e6df5a24c7d98",
    FIREBASE_MEASUREMENT_ID: "G-1TJZ1PV7TJ"
    // Add other keys you want here
  }
};

const getEnvVars = (env = process.env.GCLOUD_PROJECT) => {
  // What is __DEV__ ?
  // This variable is set to true when react-native is running in Dev mode.
  // __DEV__ is true when run locally, but false when published.
  let serviceAccount = serviceAccountDev;
  let api = ENV.dev;

  switch (env) {
    case ENV.dev.FIREBASE_PROJECT_ID:
      serviceAccount = serviceAccountDev;
      api = ENV.dev;
      break;

    case ENV.staging.FIREBASE_PROJECT_ID:
      serviceAccount = serviceAccountStaging;
      api = ENV.staging;
      break;

    case ENV.prod.FIREBASE_PROJECT_ID:
      serviceAccount = serviceAccountProd;
      api = ENV.prod;
      break;
  }

  return { serviceAccount, api };
};

module.exports = getEnvVars;
