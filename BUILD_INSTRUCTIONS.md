# Development Build Instructions for Call Feature

## Why You Need a Development Build

The call feature uses WebRTC which requires native modules. **Expo Go does NOT support native modules**, so you MUST use a development build.

## Quick Solution: Build Development Client

### Option 1: Build Locally (Fastest for Testing)

#### For iOS Simulator:
```bash
npx expo run:ios
```

#### For Android:
```bash
npx expo run:android
```

This will:
- Build the native app with all native modules
- Install it on your device/simulator
- Start the development server

### Option 2: Build with EAS (For Physical Devices)

#### For iOS Device:
```bash
eas build --profile development --platform ios
```

#### For Android Device:
```bash
eas build --profile development --platform android
```

After the build completes:
1. Download and install the build on your device
2. Run `npx expo start --dev-client`
3. Scan the QR code with the development build (NOT Expo Go)

## Important Notes:

1. **DO NOT use Expo Go** - It won't work with WebRTC
2. **Use the development build** - It has all native modules compiled
3. **After building**, always use `npx expo start --dev-client` (not `expo start`)

## Troubleshooting:

If you get build errors:
1. Make sure you have Xcode installed (for iOS)
2. Make sure you have Android Studio installed (for Android)
3. Run `npx expo prebuild --clean` to regenerate native folders
4. For iOS: `cd ios && pod install && cd ..`
5. Try building again

## Current Status:

✅ You have `expo-dev-client` installed
✅ You have EAS configured
✅ Native modules are configured in `app.json`
❌ You need to BUILD the development client

