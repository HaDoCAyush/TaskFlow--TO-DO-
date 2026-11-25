# TaskFlow

<p align="center">
  <strong>A simple, local-first task manager for Android.</strong><br/>
  Built with React Native, Expo and TypeScript.
</p>

<p align="center">
  <a href="https://github.com/HaDoCAyush/TaskFlow--TO-DO-"><img alt="Platform" src="https://img.shields.io/badge/platform-Android-3DDC84?logo=android&logoColor=white" /></a>
  <img alt="React Native" src="https://img.shields.io/badge/React%20Native-0.88-20232A?logo=react&logoColor=61DAFB" />
  <img alt="Expo SDK" src="https://img.shields.io/badge/Expo-SDK%2058-000020?logo=expo&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/license-not%20specified-lightgrey" />
</p>

TaskFlow helps people organize everyday work with priorities, due dates, categories and subtasks. It is designed **local-first**: tasks are stored on the device using SQLite, so the core task manager does not require an account or an internet connection.

> **Project status:** The Android app has been built as an installable APK and opened successfully on a physical Android phone. Firebase cloud backup is optional and has not been configured for this published project. This repository is an actively developed project, not a claim of Play Store release or production certification.

## Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Download the Android preview](#download-the-android-preview)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Optional Firebase backup](#optional-firebase-backup)
- [Quality checks](#quality-checks)
- [Known limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Documentation](#documentation)

## Features

- Create, edit, complete and delete tasks
- Low, medium and high priority levels
- Due dates, descriptions and categories
- Subtasks for breaking work into smaller steps
- Search and priority filtering
- All, Today, Upcoming and Overdue task views
- Light and dark appearance
- Local persistence with SQLite
- Local due-date reminders
- Optional Firebase cloud backup with anonymous authentication
- Android builds managed through Expo Application Services (EAS)

## Screenshots

Screenshots from the physical-device build will be added here. See [screenshots/README.md](screenshots/README.md) for the image checklist and suggested filenames.

<!-- Add actual device screenshots in this section when available. Do not use mock screenshots. -->

## Download the Android preview

An Android preview APK was successfully built with EAS and installed on a physical Android phone.

**[Open the EAS build page and download the APK](https://expo.dev/accounts/hadocayush/projects/taskflow/builds/95c4c2d0-d137-4e05-bb98-7b13a7b914e8)**

The build page is the source of truth for the available artifact. Android may ask you to allow installation from the browser or file manager. This is a preview build shared directly through EAS, not a Google Play Store release.

## Tech stack

| Area | Technology |
|---|---|
| Mobile app | React Native |
| Framework and builds | Expo SDK 58, EAS Build |
| Language | TypeScript |
| Local database | Expo SQLite |
| State management | Zustand |
| Icons | Lucide React Native |
| Cloud backup (optional) | Firebase Authentication and Cloud Firestore |
| Network status | React Native NetInfo |
| Notifications | Expo Notifications |

## Architecture

TaskFlow separates the user interface, state, persistence and optional cloud services.

```text
App.tsx / UI components
        |
        v
Zustand task store
        |
        +--------------------+
        |                    |
        v                    v
SQLite database       Reminder service
(local source         (local notifications)
 of truth)
        |
        v
Sync service (optional)
        |
        v
Firebase Auth + Cloud Firestore
```

- **UI:** `App.tsx` and `src/components/` render the app and task editor.
- **State:** `src/store/tasks.ts` exposes task operations through Zustand.
- **Persistence:** `src/database/db.ts` stores tasks in SQLite.
- **Services:** `src/services/` contains notification, Firebase and sync logic.
- **Types and theme:** `src/types/` and `src/theme/` hold shared task types and colors.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the data flow and design details.

## Getting started

### Requirements

- Node.js 22.13 or newer recommended for this Expo SDK setup
- npm
- Expo Go on an Android phone for development preview, or an Android emulator
- An Expo account for EAS cloud builds
- A Firebase project only if you want to enable optional cloud backup

### 1. Clone the repository

```bash
git clone https://github.com/HaDoCAyush/TaskFlow--TO-DO-.git
cd TaskFlow--TO-DO-
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npx expo start
```

Scan the QR code with Expo Go, or use the Expo CLI shortcuts to open an available emulator. If your phone and computer cannot connect over the local network, sign in to Expo CLI and try:

```bash
npx expo start --tunnel
```

### Windows PowerShell setup

A helper script is included:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\setup.ps1
npx expo start
```

Run commands from the repository root.

## Optional Firebase backup

The app's task features work locally without Firebase. To enable cloud backup, follow [FIREBASE_SETUP.md](FIREBASE_SETUP.md).

Important behavior to understand before enabling it:

- The app uses anonymous Firebase Authentication; there is no email/password account flow.
- Cloud data is scoped to the anonymous installation identity.
- Reinstalling the app or clearing its data can remove the locally persisted anonymous identity. Without an account-recovery or device-linking feature, the previous cloud data may not be recoverable from a fresh installation.
- Firestore security rules are required. Do not treat client-side Firebase configuration as a substitute for database rules.
- Do not store sensitive personal information in task descriptions.

## Quality checks

Run these from the project root:

```bash
npm run typecheck
npx expo-doctor
```

A previous development check completed TypeScript with no errors and Expo Doctor with 20/20 checks. Re-run both after making changes; results can vary with dependency or environment changes.

The repository includes a manual test plan in [TEST_PLAN.md](TEST_PLAN.md). Physical-device testing has confirmed that the app launches and runs on an Android phone. Broader regression coverage and automated tests remain future work.

## Known limitations

- Android is the currently targeted platform; iOS support has not been validated.
- Firebase cloud backup is optional and is not configured in the public repository.
- Anonymous cloud backup is installation-scoped and is not a full cross-device account/restore system.
- Expo Go on Android has runtime limitations around notifications. Test local reminders in the standalone Android build; remote push notifications require a development build or other appropriate native build setup.
- The app has a manual QA checklist; an automated test suite is not currently included.
- The APK linked above is an EAS preview build, not a Play Store release.

## Roadmap

- [ ] Add real screenshots from the Android app
- [ ] Add automated unit and component tests
- [ ] Improve notification reliability and reminder settings
- [ ] Add a calendar-focused task view
- [ ] Add recurring tasks
- [ ] Add task statistics and productivity insights
- [ ] Design a safe account or device-transfer flow before promising cross-device restore
- [ ] Prepare and validate a production release

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Android build guide](ANDROID_BUILD.md)
- [Firebase setup](FIREBASE_SETUP.md)
- [Manual QA plan](TEST_PLAN.md)
- [Contribution guide](CONTRIBUTING.md)
- [Security notes](SECURITY.md)
- [Portfolio summary](docs/PORTFOLIO.md)

## Contributing

Issues and thoughtful suggestions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

---

Built as a hands-on mobile development project to learn and apply React Native, TypeScript, local data persistence, state management and mobile build workflows.
