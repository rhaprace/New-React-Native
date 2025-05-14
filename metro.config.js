// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

const config = getDefaultConfig(__dirname);

// Add path alias resolution
config.resolver.extraNodeModules = {
  "@": __dirname,
};

// Ensure symlinks work
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle path aliases
  if (moduleName.startsWith("@/")) {
    const newPath = moduleName.replace("@/", `${__dirname}/`);
    return context.resolveRequest(context, newPath, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = wrapWithReanimatedMetroConfig(config);
