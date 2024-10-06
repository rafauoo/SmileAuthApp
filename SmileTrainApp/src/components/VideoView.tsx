import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { ResizeMode, Video } from "expo-av";
import IconButton from "./IconButton"; // Importuj swój komponent przycisku
import { sendVideoToServer } from "../hooks/sendToServer";

interface VideoViewProps {
  video: string;
  setVideo: React.Dispatch<React.SetStateAction<string>>;
}

export default function VideoViewComponent({ video, setVideo }: VideoViewProps) {
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playAsync();
    }
  }, [video]);

  const handleCancel = () => {
    setVideo(""); // Anuluj wideo
  };

  const handleSend = async () => {
    await sendVideoToServer(video); // Wyślij wideo do serwera
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: video }}
        style={styles.video}
        isLooping
        resizeMode={ResizeMode.COVER}// Możesz zmienić na 'cover', jeśli chcesz inne zachowanie
      />
      <View style={styles.buttonContainer}>
        <IconButton
          onPress={handleCancel}
          iosName={"xmark"} // Ikona dla iOS
          androidName="close" // Ikona dla Android
          color="white" // Ustaw kolor
          containerPadding={15} containerWidth={75} iconSize={45}
        />
        <IconButton
          onPress={handleSend}
          iosName={"square.and.arrow.up"} // Ikona dla iOS
          androidName="upload" // Ikona dla Android
          color="white" // Ustaw kolor
          containerPadding={15} containerWidth={75} iconSize={45}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    backgroundColor: "gray", // Ustaw tło na czarne
  },
  video: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0
  },
  buttonContainer: {
    flexDirection: "row", // Ustawia przyciski w linii
    justifyContent: "space-between", // Rozdziela przyciski na lewą i prawą stronę
    marginTop: 20, // Odstęp nad przyciskami
    position: "absolute", // Użyj 'absolute', aby umieścić na dole
    bottom: 20, // Ustaw położenie w dół
    left: 0,
    right: 0,
    paddingHorizontal: 20, // Odstęp wewnętrzny
    borderRadius: 10, // Dodaj zaokrąglone krawędzie
  },
});
