/**
 * Google Sign-In configuration.
 *
 * ┌─────────────────────────── ACTION REQUIRED ───────────────────────────┐
 * │ Replace WEB_CLIENT_ID with the OAuth 2.0 *Web* client ID from your     │
 * │ Google Cloud / Firebase project (APIs & Services → Credentials).      │
 * │                                                                       │
 * │ You also need an *Android* OAuth client whose SHA-1 matches the       │
 * │ signing key EAS uses. Get it with:  `eas credentials`                 │
 * │ (Android → Keystore → SHA-1 fingerprint), then register that SHA-1    │
 * │ plus the package id `com.rawatvijay.dailyexpense` in Google Cloud.    │
 * │                                                                       │
 * │ Until this is set, the Login screen shows a configuration notice and  │
 * │ the app can still be opened in "Skip / demo" mode (see AuthContext).  │
 * └───────────────────────────────────────────────────────────────────────┘
 */
export const WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';

export const isGoogleConfigured = () =>
  WEB_CLIENT_ID.length > 0 && !WEB_CLIENT_ID.startsWith('YOUR_WEB_CLIENT_ID');
