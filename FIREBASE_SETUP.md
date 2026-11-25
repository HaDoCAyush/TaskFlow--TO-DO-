# Firebase setup (optional)

Local-only task management works without Firebase. Complete this setup only if automatic cloud backup is required.

## 1. Create a Firebase project

1. Open the Firebase Console: https://console.firebase.google.com/
2. Create a project named `TaskFlow` (or choose an existing project).
3. Add a Web App to the Firebase project.
4. Copy the Firebase web app configuration values.

## 2. Enable anonymous authentication

1. In Firebase Console, open Authentication.
2. Select Sign-in method.
3. Enable **Anonymous**.
4. Save.

TaskFlow uses anonymous authentication in the background. Users do not enter an email address or password.

## 3. Create Firestore

1. Open Firestore Database.
2. Create a database.
3. Choose a region appropriate for your users.
4. Start in production mode.
5. Open the Rules tab and publish the rules from `firebase/firestore.rules`.

The rules restrict each anonymous user to their own `/users/{uid}/tasks` collection.

## 4. Add configuration to the project

1. Copy `.env.example` to `.env` in the project root.
2. Fill the values from the Firebase Web App config:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

3. Stop Expo if it is running.
4. Restart with cache clear:

```powershell
npx expo start --clear
```

## 5. Verify

- Create a task while online.
- Check Firestore at `users/{anonymousUid}/tasks/{taskId}`.
- Turn off internet and create another task. It must remain visible locally.
- Turn internet back on and tap **Back up now** in Settings.
- Confirm the task appears in Firestore.

## Privacy and identity limitation

Anonymous Firebase identities are installation-scoped. The Firebase Auth user is persisted locally by the SDK, but uninstalling the app or clearing its app data may remove the local identity. Without an account, recovery phrase, or device-pairing flow, the old anonymous cloud data cannot reliably be associated with a fresh installation.

Do not put private or highly sensitive information in tasks. Firebase web configuration values are app identifiers, not server credentials; Firestore security rules are still essential.
