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

  console.log("Web assets copy process completed.");
}

// Run the function
copyWebAssets();
