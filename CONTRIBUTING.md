# Contributing

Thanks for your interest in TaskFlow.

## Development setup

1. Install Node.js (22.13+ recommended) and npm.
2. Clone the repository and run `npm install`.
3. Start the app with `npx expo start`.
4. Use Expo Go for supported preview workflows or an Android development/standalone build for native behavior.

## Before submitting a change

Run:

```bash
npm run typecheck
npx expo-doctor
```

For changes affecting task behavior, also test the relevant scenarios in [TEST_PLAN.md](TEST_PLAN.md) on an Android device.

## Pull request expectations

- Keep changes focused and explain the user-visible impact.
- Include steps to reproduce and verify bug fixes.
- Add screenshots for UI changes when possible.
- Update documentation when behavior, setup or limitations change.
- Never commit local environment files, signing keys, service-account credentials or personal data.

## Reporting bugs

Open a GitHub issue with the device/Android version, app build/runtime, steps to reproduce, expected behavior and actual behavior. Remove tokens, personal task data and other private information from logs before sharing.
