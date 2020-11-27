// Import getEnvVars() from environment.js
import getEnvVars from '../environment';
const api = getEnvVars();

export const FIREBASE_API_KEY = api.FIREBASE_API_KEY;
export const FIREBASE_AUTH_DOMAIN = api.FIREBASE_AUTH_DOMAIN;
export const FIREBASE_DATABASE_URL = api.FIREBASE_DATABASE_URL;
export const FIREBASE_PROJECT_ID = api.FIREBASE_PROJECT_ID;
export const FIREBASE_STORAGE_BUCKET = api.FIREBASE_STORAGE_BUCKET;
export const FIREBASE_MESSAGING_SENDER_ID = api.FIREBASE_MESSAGING_SENDER_ID;

export const FIREBASE_CLOUD_FUNCTION = api.FIREBASE_CLOUD_FUNCTION;

export const FACEBOOK_APP_ID = api.FACEBOOK_APP_ID;
