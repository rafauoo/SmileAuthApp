import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import PHOTO_API_URL from "../config";

export default function PhotoModeCaptured() {
  const router = useRouter();
  const { uri } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  const sendPhoto = async () => {
    setLoading(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(photo.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const headers = {
        "Content-Type": "application/json",
      };
      const data = {
        image: base64,
      };
      const serverUrl = PHOTO_API_URL;

      axios
        .post(serverUrl, data, headers)
        .then((response) => {
          setImageWithFaces(`data:image/jpeg;base64,${response.data}`);
          console.log(response.data);
          setCapturedImage(null);
          setImageModalVisible(true);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Błąd podczas wysyłania zdjęcia:", error);
          setLoading(false); // Zakończ ładowanie w przypadku błędu
        });

      Alert.alert("Success", "Photo uploaded successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to upload photo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {uri ? (
        <Image source={{ uri }} style={styles.capturedImage} />
      ) : (
        <Text>No image data available</Text>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/PhotoMode")}
        >
          <Text style={styles.buttonText}>Take again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={sendPhoto}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Sending..." : "Send Photo"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  capturedImage: {
    width: "100%",
    height: "80%",
    resizeMode: "contain",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: "#A5D6A7",
  },
});
