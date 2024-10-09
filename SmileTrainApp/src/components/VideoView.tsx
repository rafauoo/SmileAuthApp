import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text, Alert } from "react-native";
import { ResizeMode, Video } from "expo-av";
import IconButton from "./IconButton";
import { sendVideoToServer } from "../hooks/sendToServer";
import { useRouter } from "expo-router";
import { saveEvaluation } from "../hooks/saveEvaluation";
import { useTranslation } from "react-i18next";

interface VideoViewProps {
  video: string;
  setVideo: React.Dispatch<React.SetStateAction<string>>;
}

export default function VideoViewComponent({
  video,
  setVideo,
}: VideoViewProps) {
  const videoRef = useRef<Video>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playAsync();
    }
  }, [video]);

  const handleCancel = () => {
    setVideo("");
  };

  const handleSend = async () => {
    setLoading(true);
    const result = await sendVideoToServer(video);
    console.log(result);

    if (result.success) {
      const score = result.result;
      const comment = "Komentarz";
      const scoreNum = Number(score);
      const date = await saveEvaluation(scoreNum, comment, video);
      setLoading(false);
      router.push({ pathname: "/score", params: { score, comment, date } });
    } else {
      setLoading(false);
      Alert.alert("Evaluation failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>
          {t("components.videoView.evaluating")}
        </Text>
      </View>
    );
  }

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
          containerPadding={15}
          containerWidth={75}
          iconSize={45}
        />
        <IconButton
          onPress={handleSend}
          iosName={"square.and.arrow.up"}
          androidName="cloud-upload"
          color="white"
          containerPadding={15}
          containerWidth={75}
          iconSize={45}
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
    top: 0,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "gray",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 18,
  },
});
