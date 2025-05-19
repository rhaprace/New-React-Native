# AtleTech - Fitness App

AtleTech is a comprehensive fitness application designed to help users track their workouts, plan meals, and manage their fitness journey.

## Features

- **User Authentication**: Secure login and registration using Clerk
- **Subscription Management**: Manage user subscriptions with PayMongo integration
- **Meal Planner**: Plan and track meals with nutritional information
- **Workout Tracker**: Track exercises and workout routines
- **Profile Management**: Manage user profiles and fitness goals

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Convex for database and backend functionality
- **Authentication**: Clerk for user authentication
- **Payments**: PayMongo for subscription payments
- **Styling**: Custom styling with React Native StyleSheet

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/atletech.git
   cd atletech
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

   ```
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   EXPO_PUBLIC_CONVEX_URL=your_convex_url
   EXPO_PUBLIC_PAYMONGO_SECRET_KEY=your_paymongo_secret_key
   ```

4. Start the development server:
   ```bash
   npx expo start
   ```

## Project Structure

- `app/` - Main application code with Expo Router
- `components/` - Reusable React components
- `constants/` - Application constants and theme
- `convex/` - Convex backend code (schema, mutations, queries)
- `providers/` - Context providers for the application
- `styles/` - Global styles
- `services/` - Service modules for API interactions
- `scripts/` - Utility scripts for development and deployment

### Server-Side Code Separation

For deployment, server-side code should be separated from client-side code. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on how to properly separate and deploy server and client code.

The following directories/files contain server-side code that should not be bundled with the client app:

- `convex/` - All Convex backend code
- `services/paymentService.ts` - Server-side payment processing

## Development Resources

- [Expo documentation](https://docs.expo.dev/)
- [React Native documentation](https://reactnative.dev/docs/getting-started)
- [Convex documentation](https://docs.convex.dev/)
- [Clerk documentation](https://clerk.com/docs)
- [PayMongo documentation](https://developers.paymongo.com/docs)

## License

This project is licensed under the MIT License.
