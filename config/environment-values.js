// Production environment values
// This file contains the actual environment values for production deployment
// It's safe to commit this since these are public keys (except PayMongo which should be in server env)

const environmentValues = {
  EXPO_PUBLIC_CONVEX_URL: "https://savory-coyote-898.convex.cloud",
  EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY:
    "pk_test_aW50aW1hdGUtbWFuYXRlZS05NS5jbGVyay5hY2NvdW50cy5kZXYk",
  EXPO_PUBLIC_PAYMONGO_SECRET_KEY: "sk_test_7BM4269dfvua3CRVz6n39qVB",
};

// Export for both CommonJS and ES modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { default: environmentValues };
} else if (typeof window !== "undefined") {
  // For browser environment
  window.ENVIRONMENT_VALUES = environmentValues;
}

export default environmentValues;
