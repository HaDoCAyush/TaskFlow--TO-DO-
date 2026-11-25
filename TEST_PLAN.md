# TaskFlow QA checklist

## Local data

- [ ] Launch app with no internet.
- [ ] Create a task and force-close the app.
- [ ] Reopen and verify task remains.
- [ ] Edit title, description, priority, category and due date.
- [ ] Mark complete and incomplete.
- [ ] Delete a task and verify it disappears.
- [ ] Create subtasks and verify they persist.

## Organization

- [ ] Search by title.
- [ ] Search by category.
- [ ] Filter by each priority.
- [ ] Verify Today, Upcoming and Overdue using test dates.
- [ ] Verify completed tasks are excluded from Today / Upcoming / Overdue.

## Notifications

- [ ] Grant notification permission.
- [ ] Create a task with a future due date.
- [ ] Verify a reminder is scheduled for 9:00 AM local time on that date.
- [ ] Edit the due date and verify the reminder is replaced.

## Firebase

- [ ] Verify anonymous sign-in works.
- [ ] Verify Firestore rules are published.
- [ ] Create task online and verify it uploads.
- [ ] Create task offline, reconnect, and verify it uploads.
- [ ] Delete task and verify a deletion tombstone is backed up.
- [ ] Test with Firebase disabled and verify local features still work.

## Android release

- [ ] Run `npx expo-doctor`.
- [ ] Run `npm run typecheck`.
- [ ] Build preview APK.
- [ ] Install on a physical Android device.
- [ ] Test after app restart.
- [ ] Test dark and light appearance.
- [ ] Confirm notification permission behavior.
