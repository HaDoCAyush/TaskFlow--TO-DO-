# TaskFlow architecture

This document describes the implementation currently present in the repository. It is intended to help contributors understand where behavior lives and how task data moves through the app.

## High-level design

TaskFlow is local-first. The SQLite database is the durable source of truth for on-device tasks. Zustand exposes operations to the UI. Optional cloud synchronization runs as a separate service and should not block the core local task workflow.

```text
React Native UI (App.tsx, components)
                 |
                 v
          Zustand task store
                 |
          +------+------+
          |             |
          v             v
      SQLite DB    Notification service
          |
          v
    Optional sync service
          |
          v
 Firebase Auth (anonymous) + Firestore
```

## Source map

| Path | Responsibility |
|---|---|
| `App.tsx` | App entry point, screen composition and startup hydration |
| `src/components/TaskEditor.tsx` | Task creation/editing interface |
| `src/store/tasks.ts` | Zustand store and task mutation actions |
| `src/database/db.ts` | SQLite schema and task persistence |
| `src/services/notifications.ts` | Permission handling and local due-date reminders |
| `src/services/firebase.ts` | Firebase initialization and anonymous sign-in |
| `src/services/sync.ts` | Optional Firestore synchronization |
| `src/types/task.ts` | Shared task and draft types |
| `src/theme/colors.ts` | Theme color definitions |

## Task lifecycle

1. The UI calls a store action such as `addTask`, `updateTask`, `toggleTask` or `deleteTask`.
2. The store constructs an updated task record and writes it to SQLite.
3. Zustand state is updated so the UI reflects the local change.
4. Add/update operations request a local reminder schedule based on the due date.
5. The store asks the sync service to run. If Firebase is not configured, sync reports that it is disabled and local work remains available.

## Local data model

The SQLite `tasks` table stores:

- `id`: task identifier and primary key
- `title`, `description`, `priority`, `dueDate`, `category`
- `completed`: completion state
- `subtasks`: JSON-serialized subtask array
- `createdAt`, `updatedAt`: millisecond timestamps
- `deletedAt`: nullable deletion timestamp (tombstone)
- `syncStatus`: pending/synced state for optional backup

An `app_meta` table stores small key/value metadata. Indexes support updated-time and due-date queries.

## Optional cloud synchronization

When configured, Firebase Authentication creates or reuses an anonymous user. Firestore task documents are stored under:

```text
users/{uid}/tasks/{taskId}
```

The sync service reads remote records, compares `updatedAt` timestamps and applies a last-write-wins approach. Local pending records and deletion tombstones are uploaded. Firestore rules are provided in `firebase/firestore.rules`.

### Important identity constraint

The anonymous UID is associated with the app's locally persisted Firebase Auth session. It is not a user-managed login. Clearing app data or reinstalling can lose the session and make the previous anonymous cloud namespace inaccessible from the new installation. A future cross-device restore feature would need a deliberate identity/recovery design.

## Reminders

The notification service requests permission and schedules a local reminder for 9:00 AM local time on a task's due date. Notifications should be validated on a standalone Android build as well as the intended runtime. Expo Go's Android notification support has limitations; remote push is distinct from local scheduled reminders.

## Engineering considerations

- Keep task creation, editing and completion usable offline.
- Keep persistence logic in the database module rather than duplicating SQL in components.
- Keep UI state transitions in the Zustand store.
- Treat cloud backup as optional and report sync failures without discarding local task data.
- Preserve deletion tombstones during sync to avoid accidentally resurrecting deleted tasks.
- Add automated tests around date boundaries, sync conflicts, deletion handling and offline behavior before a production release.
