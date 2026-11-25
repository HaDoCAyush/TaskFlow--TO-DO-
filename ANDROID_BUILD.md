# Android APK build and installation

## Before building

1. Complete Windows setup in `README.md`.
2. Test the app on an Android phone or emulator.
3. Configure Firebase if cloud backup is needed.
4. Run `npm run typecheck` and `npx expo-doctor`.
5. Fix all errors before distributing the app.

## Create an EAS account

EAS Build creates Android binaries in Expo's build infrastructure.

```powershell
npx eas-cli login
```

If prompted to configure the project:

```powershell
npx eas-cli build:configure
```

The project already contains `eas.json`. Confirm the EAS project configuration is added to `app.json` if the CLI asks for it.

## Build an APK for direct installation

```powershell
npx eas-cli build --platform android --profile preview
```

When the build completes, EAS provides a build page and APK download. Download the APK and transfer it to the Android phone. Android may ask the user to approve installation from that source.

## Production Play Store build

```powershell
npx eas-cli build --platform android --profile production
```

The production profile creates an Android App Bundle (AAB), typically used for Google Play submission.

## Important

The ZIP contains source code and configuration, not a prebuilt APK. A real APK must be compiled after installing dependencies and testing the app. Never distribute an untested build as production-ready.
