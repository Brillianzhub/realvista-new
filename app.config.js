import 'dotenv/config';

export default {
  expo: {
    name: "Realvista",
    slug: "realvista",
    version: "1.0.2",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    platforms: [
      "ios",
      "android"
    ],
    scheme: "realvista",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      usesAppleSignIn: true,
      bundleIdentifier: "com.brillianzhub.realvista",
      googleServicesFile: "./GoogleService-Info.plist",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSLocationWhenInUseUsageDescription: "This app requires access to your location to pick coordinates for a property.",
        NSPhotoLibraryUsageDescription: "This app requires access to your photo library so you can upload images for your properties and profile",
        NSPhotoLibraryAddUsageDescription: "This app saves images to your photo library when you choose to download property or listing photos.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      },
      googleServicesFile: "./google-services.json",
      package: "com.brillianzhub.realvista",
      permissions: [
        "android.permission.USE_BIOMETRIC",
        "android.permission.USE_FINGERPRINT",
        "android.permission.RECORD_AUDIO"
      ]
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-sqlite",
      "expo-local-authentication",
      "react-native-video",
      "expo-image-picker",
      "expo-document-picker",
      "expo-apple-authentication",
      "expo-web-browser"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
      router: {
        origin: false
      },
      eas: {
        projectId: process.env.EAS_PROJECT_ID
      }
    }
  }
};
