/* istanbul ignore file */
import React, { useCallback, useEffect } from "react";
import useAppLoading from "@/src/hooks/useAppLoading";
import usePermissionsGranted from "@/src/hooks/usePermissionsGranted";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import * as SplashScreen from "expo-splash-screen";
import { useRouter } from "expo-router";
import "../src/localization/i18n";

SplashScreen.preventAutoHideAsync();

export default function LoadingPage() {
  const router = useRouter();
  const appLoaded = useAppLoading();
  const permissionsGranted = usePermissionsGranted();

  const navigateToHome = useCallback(async () => {
    if (appLoaded && permissionsGranted) {
      await SplashScreen.hideAsync();
      router.push("/main");
    }
  }, [appLoaded, permissionsGranted, router]);
  useEffect(() => {
    navigateToHome();
  }, [appLoaded, permissionsGranted, navigateToHome]);
  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    ></Animated.View>
  );
}
