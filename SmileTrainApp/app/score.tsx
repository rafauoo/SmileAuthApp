import React, { useRef } from "react";
import { View, StyleSheet, Text } from "react-native";
import { ProgressBar } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import IconButton from "../src/components/IconButton";
import { Video, ResizeMode } from "expo-av";
import { format } from "date-fns";
import { useEffect } from "react";
import { fetchHistory } from "@/src/hooks/fetchHistory";
import { deleteEvaluation } from "@/src/hooks/deleteEvaluation";
import { Alert } from "react-native";
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

  async function handleDelete(date: string | undefined) {
    if (date) {
      console.log(date)
      Alert.alert(
        t("screens.menu.deleteAlert.title"),
        t("screens.menu.deleteAlert.desc"),
        [
          {
            text: t("screens.menu.deleteAlert.cancel"),
            style: "cancel",
          },
          {
            text: t("screens.menu.deleteAlert.ok"),
            onPress: async () => {
              const history = await fetchHistory();
              const newHistory = await deleteEvaluation(history, date);
              router.push('/menu');
            },
          },
        ]
      );
    }
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <PanGestureHandler onGestureEvent={handleSwipeRight}>
        <View style={styles.container}>
          {video ? (
            <Video
              ref={videoRef}
              source={{ uri: video }}
              style={styles.video}
              isLooping
              isMuted
              resizeMode={ResizeMode.CONTAIN}
            />
          ) : (<Text style={styles.notFoundText}>
            {t("screens.score.videoNotAv")}
          </Text>)
        }

          <View style={styles.content}>
            <Text style={styles.date}>
              {date ? format(new Date(date), "dd/MM/yyyy, H:mm:ss") : date}
            </Text>
            <View style={styles.scoreBoard}>
              <Text style={styles.scoreText}>{scoreNum.toFixed(2)}%</Text>
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
            </View>
            <Text style={styles.commentTitle}>{t("screens.score.commentTitle")}</Text>
            <Text style={styles.comment}>{comment}</Text>
            <View style={styles.bottomRow}>
              <View style={styles.bottomRowLeft}>
                <IconButton
                  onPress={handleGoBack}
                  iosName={"list.bullet"}
                  androidName="home"
                  color="white"
                  bgColor="#FF8940"
                  containerPadding={15}
                  containerWidth={70}
                  iconSize={40}
                />
              </View>
              <View style={styles.bottomRowRight}>
                <IconButton
                onPress={() => handleDelete(date)}
                iosName={"trash"}
                androidName="trash"
                bgColor="#FF8940"
                color="white"
                containerPadding={15}
                containerWidth={70}
                iconSize={40}
                />
              </View>
            </View>
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
    alignSelf: 'center'
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
    flexDirection: 'row',
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
  progressBar: {
    alignSelf: "center",
    alignItems: "flex-end",
    marginTop: 8,
    height: 20,
    width: 160,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: "#CCCCCC",
  },
  scoreText: {
    width: '50%',
    fontSize: 50,
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
    alignSelf: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  commentTitle: {
    alignSelf: 'center',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  bottomRow: {
    position: 'absolute',
    flexDirection: 'row',
    width: "100%",
    alignSelf: 'center',
    bottom: 30,
  },
  bottomRowLeft: {
    width: "50%",
    alignItems: 'flex-start'
  },
  bottomRowRight: {
    width: "50%",
    alignItems: 'flex-end'
  }
});
