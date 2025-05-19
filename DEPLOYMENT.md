# Deployment Guide

This guide explains how to properly separate server-side code from client-side code for deployment.

## Server-Side vs Client-Side Code

### Server-Side Code (Do not bundle with the app)
- `convex/` directory - Contains all Convex backend code
- `services/paymentService.ts` - Contains server-side payment processing logic
- Any other files that contain server secrets or API keys

### Client-Side Code (Safe to bundle with the app)
- `app/` directory - React Native application code
- `components/` directory - React components
- `services/paymentServiceClient.ts` - Client-side wrapper for payment services
- Other client-side utilities and components

## Separation Process

### 1. Run the Separation Script

We've created a script to help separate server-side code:

```bash
node scripts/separate-server-code.js
```

This will:
- Create a `server/` directory
- Copy all Convex files to `server/convex/`
- Copy server-side services to `server/services/`
- Create a server-specific package.json and configuration

### 2. Update .gitignore

Make sure your `.gitignore` file includes:

```
# Server-side files with sensitive information
services/paymentService.ts
.env
.env.local
.env*.local
```

### 3. Deploy Server Code

Deploy your Convex backend:

```bash
cd server
npx convex deploy
```

### 4. Build Client App

Build your React Native app for production:

```bash
# For Android
eas build --platform android --profile production

# For iOS
eas build --platform ios --profile production
```

## Environment Variables

### Server Environment Variables
These should be set in your Convex deployment:

- `PAYMONGO_SECRET_KEY`
- `PAYMONGO_WEBHOOK_SECRET`
- `BREVO_API_KEY`
- `ATLE_WEBHOOK`

### Client Environment Variables
These are safe to include in your app build:

- `EXPO_PUBLIC_CONVEX_URL`
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_PAYMONGO_SECRET_KEY` (public key only)

## Verifying Separation

Before deploying, verify that:

1. No server-side code with API secrets is bundled with the client app
2. All server-side code is properly deployed to Convex
3. Client-side code only contains public keys and references to server endpoints

## Troubleshooting

If you encounter issues:

1. Check that environment variables are properly set
2. Verify that client code only calls Convex actions and doesn't directly use server-side services
3. Make sure all API keys and secrets are only in the server deployment
