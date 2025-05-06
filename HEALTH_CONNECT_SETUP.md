# Health Connect Setup Guide

This guide will help you set up and troubleshoot the Health Connect integration in the AtleTech app.

## Common Issues

If you're seeing errors like:

```
Error requesting Health Connect permissions: [Error: The package 'react-native-health-connect' doesn't seem to be linked. Make sure:
- You rebuilt the app after installing the package
- You are not using Expo Go
]
```

Or:

```
Error checking Health Connect availability: [Error: The package 'react-native-health-connect' doesn't seem to be linked...]
```

Follow the steps below to fix these issues.

## Fix Steps

### 1. Run the Health Connect Fix Script

We've created a script to automatically fix Health Connect integration issues:

```bash
node scripts/fix-health-connect.js
```

This script will:
- Create safety wrappers to prevent crashes
- Update app.json to include the Health Connect plugin
- Create initialization utilities

### 2. Rebuild the Android Project

After running the fix script, you need to rebuild the Android project:

```bash
npx expo prebuild --clean
npx expo run:android
```

### 3. Manual Linking (If Needed)

If you're still experiencing issues, you can try manually linking the Health Connect module:

```bash
node scripts/link-health-connect.js
```

This script will modify the Android native files to properly link the Health Connect module.

## Important Notes

1. **Expo Go Limitation**: Health Connect cannot be used in Expo Go. You must build a development build with `npx expo run:android`.

2. **Fallback Mechanism**: The app will automatically fall back to using the accelerometer for step tracking if Health Connect is not available.

3. **Health Connect App**: Users need to have the Google Health Connect app installed on their device. The app will prompt them to install it if needed.

## Troubleshooting

If you're still experiencing issues:

1. Check that you're not running in Expo Go
2. Make sure you've rebuilt the app after running the fix scripts
3. Verify that the Health Connect app is installed on your device
4. Check the logs for specific error messages

## Testing Step Tracking

To test step tracking without physical movement:

1. Open the app and navigate to the Progress tab
2. If permissions are not granted, tap "Enable Step Tracking"
3. If you're in Expo Go or Health Connect is not available, tap "Use Simulated Steps"
4. The app will simulate steps every few seconds for testing purposes

## Additional Resources

- [Health Connect Documentation](https://developer.android.com/health-and-fitness/guides/health-connect)
- [React Native Health Connect Package](https://github.com/matinzd/react-native-health-connect)
