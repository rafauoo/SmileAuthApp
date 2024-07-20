import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import { Link, useNavigation, useRouter } from "expo-router";

export default function AppPhoto() {
  const [hasPermission, setHasPermission] = useState(null);
  const cameraRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [cameraType, setCameraType] = useState("back");
  const [lastPress, setLastPress] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const router = useRouter();

  const switchCameraType = () => {
    console.log("aa");
    setCameraType(cameraType === "back" ? "front" : "back");
  };

  async function toggleRecord() {
    if (isRecording) {
      cameraRef.current?.stopRecording();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      console.log(cameraRef.current);
      const response = await cameraRef.current?.recordAsync();
      setVideo(response);
      router.push({
        pathname: "/VideoModeCaptured",
        params: { uri: response.uri },
      });
    }
  }

  const onPress = () => {
    const currentTime = new Date().getTime();
    const delta = currentTime - lastPress;

    if (delta < 300) {
      switchCameraType();
    }

    setLastPress(currentTime);
  };

  const goToHome = () => {
    router.push("/"); // Zmienna ścieżka na stronę główną
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={cameraType}
        mode="video"
        ref={cameraRef}
        onCameraReady={() => console.log("camera is ready")}
      >
        <TouchableOpacity
          style={styles.touchableOpacity}
          onPress={onPress}
          activeOpacity={1}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleRecord}>
              {isRecording ? (
                <Text style={styles.buttonText}>Stop Recording</Text>
              ) : (
                <Text style={styles.buttonText}>Start Recording</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.homeButton} onPress={goToHome}>
              <Text style={styles.buttonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  touchableOpacity: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    alignItems: "center",
  },
  button: {
    fontSize: 18,
    color: "white",
    backgroundColor: "green",
    padding: 15, // Zmniejszono padding
    borderRadius: 5,
    marginBottom: 10, // Oddzielenie przycisków
    width: "80%", // Ustawienie szerokości przycisku
    alignItems: "center", // Wyśrodkowanie tekstu w przycisku
  },
  homeButton: {
    fontSize: 18,
    color: "white",
    backgroundColor: "blue",
    padding: 15, // Zmniejszono padding
    borderRadius: 5,
    width: "80%", // Ustawienie szerokości przycisku
    alignItems: "center", // Wyśrodkowanie tekstu w przycisku
  },
  buttonText: {
    fontSize: 18,
    color: "white",
  },
});
