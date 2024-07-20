import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function App() {
  const router = useRouter();

  const goToPhotoMode = async () => {
    router.replace("/PhotoMode");
  };
  const goToVideoMode = async () => {
    router.replace("/VideoMode");
  };
  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={goToPhotoMode}>
          <Text style={styles.buttonText}>Photo Mode</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={goToVideoMode}>
          <Text style={styles.buttonText}>Video Mode</Text>
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
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
});
