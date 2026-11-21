# IIT Connect Mobile (Expo)

Mobile-first Android/iOS app workspace. This is intentionally separate from the existing web frontend and uses the existing Render API.

## Start
1. Install Node.js LTS and Expo Go on your Android phone.
2. From this folder: `npm install`
3. Run: `npx expo start`
4. Scan the QR code in Expo Go.

## Build an installable Android app
Configure an Expo/EAS account and Android application signing, then use EAS Build:
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```
This produces an installable APK when the preview profile is configured with `"android": {"buildType": "apk"}`.

## API
The app is configured to use the existing backend at `https://iit-connect-backend.onrender.com`. No new database or backend is created. Authenticated News API integration should be connected to the existing backend after its publish/read endpoints are verified; the current News screen includes a clearly labeled local preview dataset.

## Product principles
- Mobile-first layouts and bottom navigation.
- Shared IIT Connect forest/sage/gold visual identity.
- Role-aware student and faculty experiences; role authorization must be enforced by the backend.
- News is a shared section for both roles.
- Student-only Trip and Travel Home stay out of Faculty navigation.
