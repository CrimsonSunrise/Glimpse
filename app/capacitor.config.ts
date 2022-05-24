import { CapacitorConfig } from "@capacitor/cli";

// const config: CapacitorConfig = {
//   appId: 'io.ionic.starter',
//   appName: 'GlimpseAppH',
//   webDir: 'build',
//   bundledWebRuntime: false
// };

const config: CapacitorConfig = {
    appId: "io.ionic.starter",
    appName: "GlimpseAppH",
    webDir: "build",
    bundledWebRuntime: false,
    plugins: {
      SplashScreen: {
        launchShowDuration: 10000,
        launchAutoHide: true,
        backgroundColor: "#ffffffff",
        androidSplashResourceName: "splash",
        androidScaleType: "CENTER_CROP",
        showSpinner: true,
        androidSpinnerStyle: "large",
        iosSpinnerStyle: "small",
        spinnerColor: "#999999",
        splashFullScreen: false,
        splashImmersive: true,
        layoutName: "launch_screen",
        useDialog: true,
      },
      LocalNotifications: {
        smallIcon: "ic_stat_icon_config_sample",
        iconColor: "#488AFF",
        sound: "beep.wav",
      },
    },
    android: {
      allowMixedContent: true
    },
    server: {
      hostname: "localhost",
    }
};

export default config;
