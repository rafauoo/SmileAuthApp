import React, { useRef } from "react";
import { View, StyleSheet, Text } from "react-native";
import { ProgressBar } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import IconButton from "../src/components/IconButton";
import { Video, ResizeMode } from "expo-av";
import { format } from "date-fns";
import { useEffect } from "react";
import { PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import {
  PanGestureHandler,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";

export default function ScoreScreen() {
  const { score, comment, date, video } = useLocalSearchParams<{
    score: string;
    comment: string;
    date: string;
    video: string;
  }>();
  const scoreNum = Number(score);
  const { t, i18n } = useTranslation();
  const videoRef = useRef<Video>(null);
  const router = useRouter();
  const [isNavigating, setIsNavigating] = React.useState<boolean>(false);

  const handleGoBack = () => {
    router.push("/menu");
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playAsync();
    }
  }, [video]);

  function handleSwipeRight(event: PanGestureHandlerGestureEvent) {
    if (event.nativeEvent.translationX > 100 && !isNavigating) {
      setIsNavigating(true);
      router.push("/menu");
    }
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler onGestureEvent={handleSwipeRight}>
        <View style={styles.container}>
          {video && (
            <Video
              ref={videoRef}
              source={{ uri: video }}
              style={styles.video}
              isLooping
              isMuted
              resizeMode={ResizeMode.CONTAIN}
            />
          )}

          <View style={styles.content}>
            <Text style={styles.title}>{t("screens.score.title")}</Text>
            <ProgressBar
              progress={scoreNum / 100}
              color={
                scoreNum > 70
                  ? "#4CAF50"
                  : scoreNum > 40
                  ? "#FFEB3B"
                  : "#F44336"
              }
              style={styles.progressBar}
            />
            <Text style={styles.scoreText}>{scoreNum.toFixed(2)}%</Text>
            <Text style={styles.comment}>{comment}</Text>
            <Text style={styles.comment}>
              {date ? format(new Date(date), "dd/MM/yyyy, H:mm:ss") : date}
            </Text>

            <IconButton
              onPress={handleGoBack}
              iosName={"list.bullet"}
              androidName="home"
              color="white"
              containerPadding={15}
              containerWidth={75}
              iconSize={45}
            />
          </View>
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  video: {
    width: "100%",
    height: "45%",
    backgroundColor: "#F0F4F8",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E86C1",
    marginBottom: 30,
  },
  progressBar: {
    height: 15,
    width: "90%",
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "#E0E0E0",
  },
  scoreText: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#424242",
    marginBottom: 15,
  },
  comment: {
    fontSize: 18,
    textAlign: "center",
    color: "#555",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  iconButton: {
    backgroundColor: "#2E86C1",
    borderRadius: 50,
    marginTop: 10,
  },
});
