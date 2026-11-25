$ErrorActionPreference = "Stop"
Write-Host "Installing TaskFlow base dependencies..." -ForegroundColor Cyan
npm install
Write-Host "Installing Expo SDK-compatible native packages..." -ForegroundColor Cyan
npx expo install expo-sqlite expo-notifications expo-device expo-constants expo-status-bar expo-linear-gradient react-native-safe-area-context react-native-screens react-native-svg @react-native-async-storage/async-storage @react-native-community/netinfo
Write-Host "Aligning dependencies with the installed Expo SDK..." -ForegroundColor Cyan
npx expo install --fix
Write-Host "Running Expo diagnostics..." -ForegroundColor Cyan
npx expo-doctor
Write-Host "Setup finished. Run: npm start" -ForegroundColor Green
