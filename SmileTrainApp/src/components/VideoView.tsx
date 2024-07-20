import { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Alert, Button } from "react-native";
import IconButton from "./IconButton";
import { TapGestureHandler, State } from "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { shareAsync } from "expo-sharing";
import { saveToLibraryAsync } from "expo-media-library";
import { sendVideoToServer } from "../hooks/sendToServer";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  StretchOutX,
} from "react-native-reanimated";

interface VideoViewProps {
  video: string;
  setVideo: React.Dispatch<React.SetStateAction<string>>;
}
export default function VideoViewComponent({
  video,
  setVideo,
}: VideoViewProps) {
  const ref = useRef<VideoView>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const player = useVideoPlayer(video, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  useEffect(() => {
    const subscription = player.addListener("playingChange", (isPlaying) => {
      setIsPlaying(isPlaying);
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  return (
    <Animated.View
      layout={LinearTransition}
      entering={FadeIn.duration(50)}
      exiting={StretchOutX}
    >
      <View style={styles.container}>
        <IconButton
          onPress={() => setVideo("")}
          iosName={"xmark"}
          androidName="close"
        />
        <IconButton
          onPress={async () => await sendVideoToServer(video)}
          iosName={"square.and.arrow.up"}
          androidName="close"
        />
      </View>

      <VideoView
        ref={ref}
        style={{
          width: "100%",
          height: "100%",
        }}
        player={player}
        allowsFullscreen
        nativeControls={true}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    bottom: 50,
    position: "absolute",
    alignSelf: "center",
    justifyContent: "center",
    zIndex: 1,
    flexDirection: "row", // Ustawia ikony poziomo
    alignItems: "center", // Centruje ikony w pionie
    gap: 200, // Odstęp między ikonami
  },
});
