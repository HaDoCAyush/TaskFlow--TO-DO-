# TaskFlow — portfolio project summary

## Short description

Built TaskFlow, an Android task management app using React Native, Expo and TypeScript, with local-first SQLite persistence and optional Firebase cloud backup.

## Resume-ready project entry

**TaskFlow | React Native, Expo, TypeScript, SQLite, Zustand, Firebase**

- Developed an Android task manager with task creation, editing, completion, priorities, due dates, categories, descriptions, subtasks, search and filtering.
- Implemented local-first persistence with Expo SQLite and centralized task state/actions using Zustand.
- Designed an optional Firebase Authentication and Cloud Firestore backup flow with offline-aware synchronization and deletion tombstones.
- Integrated local due-date reminders and configured Android preview/production build profiles using Expo Application Services.
- Built and installed an Android preview APK on a physical device; validated app launch and core operation.

Only claim features you have personally tested when discussing the project. Firebase backup is optional and has not been configured in the published repository. Do not describe anonymous backup as a complete cross-device account/restore system.

## Interview talking points

1. Why choose local-first storage for a task manager?
2. How does the UI interact with the Zustand store?
3. How are tasks persisted in SQLite?
4. How does the sync service handle offline changes and deletions?
5. What are the limitations of anonymous Firebase authentication?
6. How do Expo Go, development builds and EAS preview builds differ?
7. What would you test before releasing this app to a wider audience?

## Project links

- Source: https://github.com/HaDoCAyush/TaskFlow--TO-DO-
- Android preview build: https://expo.dev/accounts/hadocayush/projects/taskflow/builds/95c4c2d0-d137-4e05-bb98-7b13a7b914e8
