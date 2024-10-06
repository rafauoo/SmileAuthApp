import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { ResizeMode, Video } from "expo-av";
import IconButton from "./IconButton";
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
    setVideo("");
  };

  const handleSend = async () => {
    await sendVideoToServer(video);
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: video }}
        style={styles.video}
        isLooping
        resizeMode={ResizeMode.COVER}
      />
      <View style={styles.buttonContainer}>
        <IconButton
          onPress={handleCancel}
          iosName={"xmark"}
          androidName="close"
          color="white"
          containerPadding={15} containerWidth={75} iconSize={45}
        />
        <IconButton
          onPress={handleSend}
          iosName={"square.and.arrow.up"}
          androidName="cloud-upload"
          color="white"
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
    backgroundColor: "gray",
  },
  video: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
});
