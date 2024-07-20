import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import { Link, useNavigation, useRouter } from "expo-router";

export default function AppPhoto() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [cameraType, setCameraType] = useState("back");
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastPress, setLastPress] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageWithFaces, setImageWithFaces] = useState(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);
  const takePicture = async () => {
    try {
      if (!cameraRef) {
        throw new Error("Brak dostępu do kamery");
      }
      let photo = await cameraRef.takePictureAsync();
      setCapturedImage(photo.uri);
      console.log(photo);
      router.push({
        pathname: "/PhotoModeCaptured",
        params: { uri: photo.uri, width: photo.width, height: photo.height },
      });
    } catch (error) {
      Alert.alert("Błąd", error.message);
      setLoading(false); // Zakończ ładowanie w przypadku błędu
    }
  };

  const switchCameraType = () => {
    console.log("aa");
    setCameraType(cameraType === "back" ? "front" : "back");
  };

  const onPress = () => {
    const currentTime = new Date().getTime();
    const delta = currentTime - lastPress;

    if (delta < 300) {
      switchCameraType();
    }

    setLastPress(currentTime);
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>Brak dostępu do kamery</Text>;
  }
  const goToHome = () => {
    router.push("/"); // Zmienna ścieżka na stronę główną
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={cameraType}
        ref={(ref) => setCameraRef(ref)}
      >
        <TouchableOpacity
          style={styles.touchableOpacity}
          onPress={onPress}
          activeOpacity={1}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <Text style={styles.buttonText}>Take Photo</Text>
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
