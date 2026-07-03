# Daily Expense 💸

A simple daily expense tracker for Android, built with [Expo](https://expo.dev) (React Native
+ TypeScript). Expenses are stored **on-device** with SQLite, and **Google Sign-In** acts as a
lightweight lock/identity gate. Packaged for the Google Play Store via EAS Build.

## Tech stack

- **Expo** (managed) + **expo-router** (file-based routing)
- **TypeScript**
- **expo-sqlite** — local, offline expense storage
- **Google Sign-In** — identity gate (requires an Expo dev build, not Expo Go)
- **EAS Build** — produces the signed `.aab` for Play Store

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

   In the output you'll find options to open the app in a
   [development build](https://docs.expo.dev/develop/development-builds/introduction/),
   an [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/), or an
   [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/).

App code lives in the **src/app** directory and uses
[file-based routing](https://docs.expo.dev/router/introduction).

## Roadmap

- [x] Project scaffold (Expo + TypeScript + expo-router)
- [x] Local SQLite data layer (expenses + categories)
- [x] Google Sign-In auth gate with persisted session
- [x] Screens: dashboard, add/edit expense, history, settings
- [x] EAS build profiles (`eas.json`)
- [ ] Configure Google OAuth client ID (`src/auth/config.ts`)
- [ ] First Play Store release (create developer account, `eas build`, upload)

## Configuration needed before release

1. **Google Sign-In:** create a Google Cloud / Firebase project, add an OAuth
   **Web** client ID to `src/auth/config.ts`, and register an **Android** client
   with the EAS signing SHA-1 (`eas credentials`) for package
   `com.rawatvijay.dailyexpense`. Until then the app runs in offline/guest mode.
2. **Play Store:** create a Google Play Developer account ($25), then
   `eas build -p android --profile production` to produce the signed `.aab`.

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
