import React, { useRef } from "react";
import { View, StyleSheet, Text } from "react-native";
import { ProgressBar } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import { format } from "date-fns";
import BottomRowScore from "@/src/components/BottomRowScore";
import { PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import {
  PanGestureHandler,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
import getProgressBarColor from "@/src/functions/getProgressBarColor";

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
  console.log(video);
  function handleSwipeRight(event: PanGestureHandlerGestureEvent) {
    if (event.nativeEvent.translationX > 100 && !isNavigating) {
      setIsNavigating(true);
      router.push("/menu");
    }
  }
  /* istanbul ignore next */
  return (
    <GestureHandlerRootView style={styles.root}>
      <PanGestureHandler
        onGestureEvent={handleSwipeRight}
        testID="PanGestureHandler"
      >
        <View style={styles.container}>
          {video ? (
            <Video
              ref={videoRef}
              source={{ uri: video }}
              style={styles.video}
              isLooping
              onLoad={() => videoRef.current?.playAsync()}
              isMuted
              resizeMode={ResizeMode.CONTAIN}
            />
          ) : (
            <Text style={styles.notFoundText}>
              {t("screens.score.videoNotAv")}
            </Text>
          )}

          <View style={styles.content}>
            <Text style={styles.date}>
              {date
                ? format(new Date(date), "dd/MM/yyyy, H:mm:ss")
                : t("screens.score.noDateAvailable")}
            </Text>
            <View style={styles.scoreBoard}>
              <Text style={styles.scoreText}>{scoreNum.toFixed(2)}%</Text>
              <View style={styles.progressBarContainer}>
                <ProgressBar
                  animatedValue={scoreNum / 100}
                  color={getProgressBarColor(scoreNum)}
                  style={styles.progressBar}
                />
              </View>
            </View>
            <Text style={styles.commentTitle}>
              {t("screens.score.commentTitle")}
            </Text>
            <Text style={styles.comment}>{comment}</Text>
            <BottomRowScore date={date} />
          </View>
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  notFoundText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#424242",
    marginTop: 100,
    marginBottom: 100,
    alignSelf: "center",
  },
  root: {
    flex: 1,
    backgroundColor: "#ECEFF1",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ECEFF1",
  },
  scoreBoard: {
    flexDirection: "row",
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "40%",
    backgroundColor: "#ECEFF1",
    borderRadius: 15,
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  progressBarContainer: {
    marginBottom: 8,
    marginLeft: 10,
    width: "45%",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: 20,
    borderRadius: 5,
    backgroundColor: "#CCCCCC",
  },
  scoreText: {
    width: "50%",
    fontSize: 45,
    fontWeight: "bold",
    color: "#424242",
    marginBottom: 10,
  },
  comment: {
    fontSize: 18,
    color: "#757575",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  date: {
    marginTop: -5,
    alignSelf: "center",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },
  commentTitle: {
    alignSelf: "center",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
  },
  bottomRow: {
    position: "absolute",
    flexDirection: "row",
    width: "100%",
    alignSelf: "center",
    bottom: 30,
  },
  bottomRowLeft: {
    width: "50%",
    alignItems: "flex-start",
  },
  bottomRowRight: {
    width: "50%",
    alignItems: "flex-end",
  },
});
