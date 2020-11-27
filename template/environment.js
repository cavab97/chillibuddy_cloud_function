/*****************************
* environment.js
* path: '/environment.js' (root of your project)
******************************/

const ENV = {
 dev: {
//    apiUrl: localhost,
//    amplitudeApiKey: null,
        FIREBASE_API_KEY : "AIzaSyDKmyewOf5zdgVYrgg0u44SMFEcyrmvKmA",
        FIREBASE_AUTH_DOMAIN : "gogogain-dev.firebaseapp.com",
        FIREBASE_DATABASE_URL : "https://gogogain-dev.firebaseio.com/",
        FIREBASE_PROJECT_ID : "gogogain-dev",
        FIREBASE_STORAGE_BUCKET : "gs://gogogain-dev.appspot.com/",
        FIREBASE_MESSAGING_SENDER_ID : "473612187597",
        
        FIREBASE_CLOUD_FUNCTION : 'https://us-central1-gogogain-dev.cloudfunctions.net',
        
        FACEBOOK_APP_ID : "440875199903483",
 },
 staging: {
//    apiUrl: "[your.staging.api.here]",
//    amplitudeApiKey: "[Enter your key here]",
        FIREBASE_API_KEY : "AIzaSyCANZCZHh4q42J8NM2kWWBp0be6OdlPhRI",
        FIREBASE_AUTH_DOMAIN : "gogogain-stanging.firebaseapp.com",
        FIREBASE_DATABASE_URL : "https://gogogain-stanging.firebaseio.com/",
        FIREBASE_PROJECT_ID : "gogogain-stanging",
        FIREBASE_STORAGE_BUCKET : "gs://gogogain-stanging.appspot.com",
        FIREBASE_MESSAGING_SENDER_ID : "1042206429903",

        FIREBASE_CLOUD_FUNCTION : 'https://us-central1-gogogain-stanging.cloudfunctions.net',

        FACEBOOK_APP_ID : "440875199903483",
   // Add other keys you want here
 },
 prod: {
//    apiUrl: "[your.production.api.here]",
//    amplitudeApiKey: "[Enter your key here]",
        FIREBASE_API_KEY : "AIzaSyAo-D7vn70nwtBfFJTQWaJdkJEVR-9b-iY",
        FIREBASE_AUTH_DOMAIN : "gogogain-gogogain.firebaseapp.com",
        FIREBASE_DATABASE_URL : "https://gogogain-gogogain.firebaseio.com/",
        FIREBASE_PROJECT_ID : "gogogain-gogogain",
        FIREBASE_STORAGE_BUCKET : "gs://gogogain-gogogain.appspot.com/",
        FIREBASE_MESSAGING_SENDER_ID : "431448808009",

        FIREBASE_CLOUD_FUNCTION : 'https://us-central1-gogogain-gogogain.cloudfunctions.net',

        FACEBOOK_APP_ID : "440875199903483",
   // Add other keys you want here
 }
};

const getEnvVars = () => {
 // What is __DEV__ ?
 // This variable is set to true when react-native is running in Dev mode.
 // __DEV__ is true when run locally, but false when published.
 
 if (process.env.GCLOUD_PROJECT === 'gogogain-dev') {
  console.log('running in development mode')
   return ENV.dev;
 } else if (process.env.GCLOUD_PROJECT === 'gogogain-stanging') {
  console.log('running in staging mode')
   return ENV.staging;
 } else if (process.env.GCLOUD_PROJECT === 'gogogain-gogogain') {
  console.log('running in prod mode')
   return ENV.prod;
 }
};

export default getEnvVars;