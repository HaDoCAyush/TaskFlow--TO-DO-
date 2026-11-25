# TaskFlow

A React Native / Expo Android task manager with local-first SQLite storage and optional Firebase cloud backup.

## What's included

- Create, edit, complete and delete tasks
- Low / Medium / High priorities
- Due dates, categories, descriptions and subtasks
- Search and priority filtering
- All, Today, Upcoming and Overdue views
- Dark and light appearance
- Local SQLite persistence
- Offline-first changes with a sync queue
- Optional anonymous Firebase backup
- Local notifications for task due dates
- Android APK build profiles

## Important product behavior

TaskFlow does not require users to create an account to use the app. Tasks are stored on the device first.

If Firebase is configured, TaskFlow signs in anonymously and backs up tasks to that installation's anonymous Firebase identity. This is not a cross-device account system. Clearing app data or reinstalling may remove the locally persisted anonymous identity, making the old cloud backup inaccessible. Do not advertise this as guaranteed cross-device restore.

Without Firebase configuration, all core task features work locally. The sync screen explains that cloud backup is not configured.

## Requirements

- Node.js 22.13+ recommended for Expo SDK 58
- npm
- Android phone with Expo Go for initial preview, or Android Studio emulator
- Firebase project only if cloud backup is wanted
- EAS account only for building a distributable APK

## Windows setup (PowerShell)

1. Extract the ZIP to a folder such as `D:\Coding\TaskFlow`.
2. Open that folder in VS Code.
3. Open Terminal > New Terminal.
4. Run:

   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   .\scripts\setup.ps1
   ```

5. Start the app:

   ```powershell
   npm start
   ```

6. Scan the Expo QR code using Expo Go on an Android phone, or press `a` to open an Android emulator.

If `scripts/setup.ps1` is blocked, run the commands in it one by one from the project root.

## Firebase cloud backup setup

See [FIREBASE_SETUP.md](FIREBASE_SETUP.md). Firebase is optional for local task management.

## Type checking and diagnostics

```powershell
npm run typecheck
npx expo-doctor
```

## Build an installable Android APK

See [ANDROID_BUILD.md](ANDROID_BUILD.md). A preview APK is configured in `eas.json`.

## Project layout

```text
TaskFlow/
├── App.tsx
├── app.json
├── assets/
├── firebase/
├── scripts/
├── src/
│   ├── components/
│   ├── database/
│   ├── services/
│   ├── store/
│   ├── theme/
│   └── types/
├── .env.example
├── eas.json
└── package.json
```

## Current implementation notes

- SQLite is the source of truth for on-device task operations.
- Mutations are written locally before any cloud operation.
- Pending records are retried after a local change, when connectivity returns, or when the user taps Back up now.
- Deleted tasks are retained as tombstones so a later backup does not resurrect them.
- Cloud conflict handling uses the most recent `updatedAt` timestamp.
- Due-date reminders are scheduled for 9:00 AM local time on the due date.
- The date field currently accepts validated `YYYY-MM-DD` text input.
- The selected light/dark theme is saved locally.
- Cloud sync requires network connectivity and Firebase configuration.
- This starter project should be compiled and tested on a real Android device before production release.

