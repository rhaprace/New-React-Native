const fs = require("fs");
const path = require("path");

// Ensure directories exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Copy file from source to destination
function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    console.log(`Copied: ${source} -> ${destination}`);
  } catch (error) {
    console.error(`Error copying ${source}: ${error.message}`);
  }
}

// Main function to copy web assets
function copyWebAssets() {
  console.log("Starting web assets copy process...");

  // Ensure dist and icons directories exist
  const distDir = path.join(__dirname, "..", "dist");
  const iconsDir = path.join(distDir, "icons");

  ensureDirectoryExists(distDir);
  ensureDirectoryExists(iconsDir);

  // Copy manifest.json
  const manifestSource = path.join(__dirname, "..", "web", "manifest.json");
  const manifestDest = path.join(distDir, "manifest.json");

  if (fs.existsSync(manifestSource)) {
    copyFile(manifestSource, manifestDest);
  } else {
    console.error(`Manifest file not found: ${manifestSource}`);
  }

  // Copy _redirects file
  const redirectsSource = path.join(__dirname, "..", "_redirects");
  const redirectsDest = path.join(distDir, "_redirects");

  if (fs.existsSync(redirectsSource)) {
    copyFile(redirectsSource, redirectsDest);
  } else {
    console.error(`_redirects file not found: ${redirectsSource}`);
    // Create a default _redirects file if it doesn't exist
    try {
      fs.writeFileSync(redirectsDest, "/* /index.html 200");
      console.log(`Created default _redirects file at ${redirectsDest}`);
    } catch (error) {
      console.error(`Error creating _redirects file: ${error.message}`);
    }
  }

  // Copy app icons
  const iconSizes = [192, 512];
  const iconSource = path.join(__dirname, "..", "assets", "images", "icon.png");

  if (fs.existsSync(iconSource)) {
    iconSizes.forEach((size) => {
      const iconDest = path.join(iconsDir, `icon-${size}.png`);
      copyFile(iconSource, iconDest);
    });
  } else {
    console.error(`Icon file not found: ${iconSource}`);
  }

  // Copy environment.js file if it exists
  const envSource = path.join(__dirname, "..", "web", "environment.js");
  const envDest = path.join(distDir, "environment.js");

  if (fs.existsSync(envSource)) {
    // Read the source file to preserve exact formatting
    try {
      const envContent = fs.readFileSync(envSource, "utf8");
      fs.writeFileSync(envDest, envContent);
      console.log(
        `Copied environment.js with exact content: ${envSource} -> ${envDest}`
      );

      // Log the first few lines for debugging
      const contentPreview = envContent.split("\n").slice(0, 6).join("\n");
      console.log(`Environment.js content preview:\n${contentPreview}\n...`);
    } catch (error) {
      console.error(`Error copying environment.js: ${error.message}`);
    }
  } else {
    console.warn(`Environment file not found: ${envSource}`);
    // Create a minimal environment.js file with placeholders
    try {
      // Use JSON.stringify for the Clerk key to ensure proper escaping
      const clerkKey =
        process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
        "placeholder_clerk_key";
      const content = `
// Fallback environment variables
window.EXPO_PUBLIC_CONVEX_URL = window.EXPO_PUBLIC_CONVEX_URL || "https://example-convex-url.convex.cloud";
window.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = ${JSON.stringify(clerkKey)};
window.EXPO_PUBLIC_PAYMONGO_SECRET_KEY = window.EXPO_PUBLIC_PAYMONGO_SECRET_KEY || "";
`;
      fs.writeFileSync(envDest, content);
      console.log(`Created fallback environment.js file at ${envDest}`);
    } catch (error) {
      console.error(`Error creating environment.js file: ${error.message}`);
    }
  }

  console.log("Web assets copy process completed.");
}

// Run the function
copyWebAssets();
