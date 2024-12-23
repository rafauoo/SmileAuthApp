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
  const commentKey = i18n.language as "pl" | "en";

  const handleCancel = () => {
    setVideo("");
  };

  const handleSend = async () => {
    setLoading(true);
    const result = await sendVideoToServer(video);

    if (result.success) {
      const score = result.result;
      const scoreNum = Number(score);
      if (result.comment) {
        const comment = result.comment;
        const save_res = await saveEvaluation(scoreNum, comment, video);
        setLoading(false);
        if (!save_res.success || !save_res.date) {
          Alert.alert(
            t("exceptions.title"),
            t("exceptions.saveEvaluationFail"),
            [
              {
                text: t("screens.menu.deleteAlert.okay"),
                onPress: handleCancel,
              },
            ]
          );
        }
        if (save_res.success && !save_res.videoSaveSuccess) {
          Alert.alert(
            t("exceptions.title"),
            t("exceptions.saveEvaluationFailVideo"),
            [
              {
                text: t("screens.menu.deleteAlert.okay"),
                onPress: handleCancel,
              },
            ]
          );
        }
        router.push({
          pathname: "/score",
          params: {
            score,
            comment: comment[commentKey],
            date: save_res.date,
            video,
          },
        });
      } else {
        const comment = { pl: "Brak komentarza.", en: "There is no comment." };
        const save_res = await saveEvaluation(scoreNum, comment, video);
        setLoading(false);
        if (!save_res.success || !save_res.date) {
          Alert.alert(
            t("exceptions.title"),
            t("exceptions.saveEvaluationFail"),
            [
              {
                text: t("screens.menu.deleteAlert.okay"),
                onPress: handleCancel,
              },
            ]
          );
        }
        if (save_res.success && !save_res.videoSaveSuccess) {
          Alert.alert(
            t("exceptions.title"),
            t("exceptions.saveEvaluationFailVideo"),
            [
              {
                text: t("screens.menu.deleteAlert.okay"),
                onPress: handleCancel,
              },
            ]
          );
        }
        router.push({
          pathname: "/score",
          params: {
            score,
            comment: comment[commentKey],
            date: save_res.date,
            video,
          },
        });
      }
    } else {
      setLoading(false);
      if (result.nonStandard && result.error) {
        Alert.alert(t("exceptions.title"), result.error, [
          {
            text: t("screens.menu.deleteAlert.okay"),
            onPress: handleCancel,
          },
        ]);
      } else {
        Alert.alert(t("exceptions.title"), t("exceptions." + result.error), [
          {
            text: t("screens.menu.deleteAlert.okay"),
            onPress: handleCancel,
          },
        ]);
      }
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
  /* istanbul ignore next */
  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: video }}
        style={styles.video}
        isLooping
        onLoad={() => videoRef.current?.playAsync()}
        isMuted
        resizeMode={ResizeMode.COVER}
      />
      <View style={styles.buttonContainer}>
        <IconButton
          onPress={handleCancel}
          iosName={"xmark"}
          testID="cancel-button"
          androidName="close"
          color="white"
          containerPadding={15}
          containerWidth={75}
          iconSize={45}
        />
        <IconButton
          onPress={handleSend}
          testID="send-button"
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
