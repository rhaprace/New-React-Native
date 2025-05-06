/**
 * Script to manually link react-native-health-connect
 * Run this script with: node scripts/link-health-connect.js
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Paths
const ANDROID_DIR = path.join(__dirname, "..", "android");
const SETTINGS_GRADLE_PATH = path.join(ANDROID_DIR, "settings.gradle");
const BUILD_GRADLE_PATH = path.join(ANDROID_DIR, "app", "build.gradle");
const MAIN_APPLICATION_JAVA_PATH = path.join(
  ANDROID_DIR,
  "app",
  "src",
  "main",
  "java",
  "com",
  "atletech",
  "app",
  "MainApplication.java"
);
const MAIN_APPLICATION_KOTLIN_PATH = path.join(
  ANDROID_DIR,
  "app",
  "src",
  "main",
  "java",
  "com",
  "atletech",
  "app",
  "MainApplication.kt"
);

// Check if Android directory exists
if (!fs.existsSync(ANDROID_DIR)) {
  console.error(
    "Android directory not found. Make sure you are running this script from the project root."
  );
  process.exit(1);
}

// Function to update settings.gradle
function updateSettingsGradle() {
  try {
    console.log("Updating settings.gradle...");

    if (!fs.existsSync(SETTINGS_GRADLE_PATH)) {
      console.error(
        'settings.gradle not found. Run "npx expo prebuild" first to generate Android files.'
      );
      return false;
    }

    let content = fs.readFileSync(SETTINGS_GRADLE_PATH, "utf8");

    // Check if already included
    if (content.includes("react-native-health-connect")) {
      console.log("Health Connect already included in settings.gradle");
      return true;
    }

    // Add the include line
    const includeStatement =
      "include ':react-native-health-connect'\nproject(':react-native-health-connect').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-health-connect/android')";

    // Find the last include statement and add after it
    const lastIncludeIndex = content.lastIndexOf("include");
    if (lastIncludeIndex !== -1) {
      const endOfLine = content.indexOf("\n", lastIncludeIndex);
      if (endOfLine !== -1) {
        content =
          content.substring(0, endOfLine + 1) +
          includeStatement +
          "\n" +
          content.substring(endOfLine + 1);
      } else {
        content += "\n" + includeStatement;
      }
    } else {
      content += "\n" + includeStatement;
    }

    fs.writeFileSync(SETTINGS_GRADLE_PATH, content);
    console.log("Successfully updated settings.gradle");
    return true;
  } catch (error) {
    console.error("Error updating settings.gradle:", error);
    return false;
  }
}

// Function to update app/build.gradle
function updateBuildGradle() {
  try {
    console.log("Updating app/build.gradle...");

    if (!fs.existsSync(BUILD_GRADLE_PATH)) {
      console.error(
        'app/build.gradle not found. Run "npx expo prebuild" first to generate Android files.'
      );
      return false;
    }

    let content = fs.readFileSync(BUILD_GRADLE_PATH, "utf8");

    // Check if already included
    if (content.includes("react-native-health-connect")) {
      console.log("Health Connect already included in build.gradle");
      return true;
    }

    // Add the implementation line
    const dependencyLine =
      "    implementation project(':react-native-health-connect')";

    // Find the dependencies block
    const dependenciesIndex = content.indexOf("dependencies {");
    if (dependenciesIndex !== -1) {
      const endOfDependenciesLine = content.indexOf("\n", dependenciesIndex);
      if (endOfDependenciesLine !== -1) {
        // Insert after the dependencies { line
        content =
          content.substring(0, endOfDependenciesLine + 1) +
          dependencyLine +
          "\n" +
          content.substring(endOfDependenciesLine + 1);
      }
    }

    fs.writeFileSync(BUILD_GRADLE_PATH, content);
    console.log("Successfully updated app/build.gradle");
    return true;
  } catch (error) {
    console.error("Error updating app/build.gradle:", error);
    return false;
  }
}

// Function to update MainApplication (Java or Kotlin)
function updateMainApplication() {
  try {
    // Check if we have a Kotlin or Java file
    const isKotlin = fs.existsSync(MAIN_APPLICATION_KOTLIN_PATH);
    const isJava = fs.existsSync(MAIN_APPLICATION_JAVA_PATH);

    if (!isKotlin && !isJava) {
      console.error(
        'MainApplication file not found. Run "npx expo prebuild" first to generate Android files.'
      );
      return false;
    }

    // Use the appropriate file path
    const filePath = isKotlin
      ? MAIN_APPLICATION_KOTLIN_PATH
      : MAIN_APPLICATION_JAVA_PATH;
    console.log(
      `Updating ${isKotlin ? "MainApplication.kt" : "MainApplication.java"}...`
    );

    let content = fs.readFileSync(filePath, "utf8");

    // Check if already included
    if (content.includes("HealthConnectPackage")) {
      console.log(
        `Health Connect already included in ${isKotlin ? "MainApplication.kt" : "MainApplication.java"}`
      );
      return true;
    }

    if (isKotlin) {
      // Kotlin implementation
      // Add the import
      const importLine =
        "import com.reactnativehealthconnect.HealthConnectPackage";

      // Find the last import statement
      const lastImportIndex = content.lastIndexOf("import");
      if (lastImportIndex !== -1) {
        const endOfImportLine = content.indexOf("\n", lastImportIndex);
        if (endOfImportLine !== -1) {
          content =
            content.substring(0, endOfImportLine + 1) +
            importLine +
            "\n" +
            content.substring(endOfImportLine + 1);
        }
      }

      // Add the package to getPackages method
      const packageLine = "      packages.add(HealthConnectPackage())";

      // Find the getPackages method
      const getPackagesIndex = content.indexOf("override fun getPackages()");
      if (getPackagesIndex !== -1) {
        // Find the return statement
        const returnIndex = content.indexOf(
          "return packages",
          getPackagesIndex
        );
        if (returnIndex !== -1) {
          // Insert before the return statement
          content =
            content.substring(0, returnIndex) +
            packageLine +
            "\n      " +
            content.substring(returnIndex);
        }
      }
    } else {
      // Java implementation
      // Add the import
      const importLine =
        "import com.reactnativehealthconnect.HealthConnectPackage;";

      // Find the last import statement
      const lastImportIndex = content.lastIndexOf("import");
      if (lastImportIndex !== -1) {
        const endOfImportLine = content.indexOf("\n", lastImportIndex);
        if (endOfImportLine !== -1) {
          content =
            content.substring(0, endOfImportLine + 1) +
            importLine +
            "\n" +
            content.substring(endOfImportLine + 1);
        }
      }

      // Add the package to getPackages method
      const packageLine = "      packages.add(new HealthConnectPackage());";

      // Find the getPackages method
      const getPackagesIndex = content.indexOf(
        "protected List<ReactPackage> getPackages()"
      );
      if (getPackagesIndex !== -1) {
        // Find the return statement
        const returnIndex = content.indexOf(
          "return packages",
          getPackagesIndex
        );
        if (returnIndex !== -1) {
          // Insert before the return statement
          content =
            content.substring(0, returnIndex) +
            packageLine +
            "\n      " +
            content.substring(returnIndex);
        }
      }
    }

    fs.writeFileSync(filePath, content);
    console.log(
      `Successfully updated ${isKotlin ? "MainApplication.kt" : "MainApplication.java"}`
    );
    return true;
  } catch (error) {
    console.error("Error updating MainApplication:", error);
    return false;
  }
}

// Main function
function main() {
  console.log("Starting manual linking of react-native-health-connect...");

  // Check if Android files exist, if not, run prebuild
  if (!fs.existsSync(ANDROID_DIR) || !fs.existsSync(SETTINGS_GRADLE_PATH)) {
    console.log("Android files not found. Running expo prebuild...");
    try {
      execSync("npx expo prebuild --platform android", { stdio: "inherit" });
    } catch (error) {
      console.error("Error running expo prebuild:", error);
      process.exit(1);
    }
  }

  // Check if MainApplication files exist
  const hasMainApplicationFile =
    fs.existsSync(MAIN_APPLICATION_JAVA_PATH) ||
    fs.existsSync(MAIN_APPLICATION_KOTLIN_PATH);

  // Update the files
  const settingsUpdated = updateSettingsGradle();
  const buildGradleUpdated = updateBuildGradle();
  const mainApplicationUpdated = updateMainApplication();

  if (settingsUpdated && buildGradleUpdated && mainApplicationUpdated) {
    console.log("\nSuccessfully linked react-native-health-connect!");
    console.log("\nNext steps:");
    console.log(
      '1. Run "npx expo prebuild --clean" to clean and rebuild the Android project'
    );
    console.log(
      '2. Run "npx expo run:android" to build and run the app on your device'
    );
  } else {
    console.error(
      "\nFailed to link react-native-health-connect. Please check the errors above."
    );
  }
}

// Run the main function
main();
