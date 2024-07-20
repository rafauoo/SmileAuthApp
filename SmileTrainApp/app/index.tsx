import React, { useCallback, useState, useEffect } from 'react';
import useAppLoading from '../src/hooks/useAppLoading';
import usePermissionsGranted from '../src/hooks/usePermissionsGranted';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import * as SplashScreen from 'expo-splash-screen';
import { useRouter } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function LoadingPage() {
  const router = useRouter();
  const appLoaded = useAppLoading()
  const permissionsGranted = usePermissionsGranted()
  const onLayoutRootView = useCallback(async () => {
    if (appLoaded && permissionsGranted) {
      await SplashScreen.hideAsync();
      router.push("/home")
    }
  }, [appLoaded]);
  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      onLayout={onLayoutRootView}>
    </Animated.View>
  );
}
