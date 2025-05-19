# Server-Side Code

This directory contains all server-side code for the application, separated from the client-side React Native code to ensure proper deployment.

## Structure

- `convex/` - Convex backend code (schema, mutations, queries, actions)
- `services/` - Server-side services (payment processing, email, etc.)
- `config/` - Server configuration

## Deployment

When deploying the application:
1. The React Native client code should be built separately from this server code
2. This server code should be deployed to your Convex instance
3. Environment variables should be properly configured in your deployment environment

## Development

During development, you can run the Convex development server with:

```bash
npx convex dev
```

Make sure your environment variables are properly set up in a `.env` file at the root of this directory.
