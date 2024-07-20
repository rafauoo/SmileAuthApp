import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { usePermissions } from "expo-media-library";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function usePermissionsGranted() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] =
    usePermissions();
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  async function requestAllPermissions() {
    const cameraStatus = await requestCameraPermission();
    if (!cameraStatus.granted) {
      Alert.alert("Error", "Camera permission is required.");
      setPermissionsGranted(false);
      return;
    }

    const microphoneStatus = await requestMicrophonePermission();
    if (!microphoneStatus.granted) {
      Alert.alert("Error", "Microphone permission is required.");
      setPermissionsGranted(false);
      return;
    }

    const mediaLibraryStatus = await requestMediaLibraryPermission();
    if (!mediaLibraryStatus.granted) {
      Alert.alert("Error", "Media Library permission is required.");
      setPermissionsGranted(false);
      return;
    }

    // only set to true once user provides permissions
    // this prevents taking user to home screen without permissions
    await AsyncStorage.setItem("hasOpened", "true");
    setPermissionsGranted(true);
  }

  useEffect(() => {
    async function prepare() {
      const permissions = requestAllPermissions();
      if (permissions) {
        setPermissionsGranted(true);
      }
    }
    prepare();
  }, [permissionsGranted]);

  return permissionsGranted;
}
