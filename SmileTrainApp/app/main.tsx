import React from "react";
import { SafeAreaView, View } from "react-native";
import {
  TapGestureHandler,
  State,
  PanGestureHandler,
  GestureEvent,
} from "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import { CameraView } from "expo-camera";
import MainRowActions from "@/src/components/MainRowActions";
import CameraTools from "@/src/components/CameraTools";
import VideoViewComponent from "@/src/components/VideoView";
import BottomRowTools from "@/src/components/BottomRowTools";
import { CameraRecordingOptions } from "expo-camera";
import { useRouter, useFocusEffect } from "expo-router";

export default function HomeScreen() {
  const cameraRef = React.useRef<CameraView>(null);
  const [cameraTorch, setCameraTorch] = React.useState<boolean>(false);
  const [cameraFlash, setCameraFlash] = React.useState<boolean>(false);
  const [cameraReady, setCameraReady] = React.useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = React.useState<"front" | "back">(
    "back"
  );
  const [isScreenFlash, setIsScreenFlash] = React.useState<boolean>(false);
  const [video, setVideo] = React.useState<string>("");
  const [isRecording, setIsRecording] = React.useState<boolean>(false);
  const router = useRouter();
  const [isNavigating, setIsNavigating] = React.useState<boolean>(false);
  /* istanbul ignore next */
  useFocusEffect(
    React.useCallback(() => {
      setIsNavigating(false);
    }, [])
  );

  const recordingOptions: CameraRecordingOptions = {
    maxDuration: 6,
    maxFileSize: 10 * 1024 * 1024, // 10 MB
  };

  async function toggleRecord() {
    if (cameraReady) {
      if (isRecording) {
        cameraRef.current?.stopRecording();
        setCameraTorch(false);
        setIsScreenFlash(false);
        setIsRecording(false);
      } else {
        setIsRecording(true);
        if (cameraFacing === "front") {
          console.log(cameraFlash);
          setIsScreenFlash(cameraFlash);
        }
        if (cameraFacing === "back") {
          setCameraTorch(cameraFlash);
        }
        const response = await cameraRef.current?.recordAsync(recordingOptions);
        if (response) {
          setCameraTorch(false);
          setIsScreenFlash(false);
          setIsRecording(false);
          setVideo(response.uri);
          setCameraReady(false);
        }
      }
    }
  }

  function handleDoubleTap(event: GestureEvent) {
    /* istanbul ignore next */
    if (event.nativeEvent.state === State.ACTIVE) {
      setCameraFacing((prev) => (prev === "back" ? "front" : "back"));
    }
  }

  function handleSwipe(event: PanGestureHandlerGestureEvent) {
    if (event.nativeEvent.translationX > 100 && !isNavigating) {
      setIsNavigating(true);
      router.push("/menu");
    }
    if (event.nativeEvent.translationX < -100 && !isNavigating) {
      setIsNavigating(true);
      router.push("/settings");
    }
  }

  if (video) {
    return <VideoViewComponent video={video} setVideo={setVideo} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler
        onGestureEvent={handleSwipe}
        testID="pan-gesture-handler"
      >
        <TapGestureHandler
          onHandlerStateChange={handleDoubleTap}
          numberOfTaps={2}
          testID="tap-gesture-handler"
        >
          <CameraView
            testID="camera-view"
            ref={cameraRef}
            style={{ flex: 1 }}
            facing={cameraFacing}
            videoQuality="720p"
            mode="video"
            zoom={0}
            enableTorch={cameraTorch}
            onCameraReady={() => setCameraReady(true)}
          >
            <SafeAreaView
              style={{
                flex: 1,
                backgroundColor: isScreenFlash ? "white" : "transparent",
              }}
            >
              <View style={{ flex: 1, padding: 6 }}>
                <CameraTools
                  cameraFlash={cameraFlash}
                  setCameraFacing={setCameraFacing}
                  setCameraFlash={setCameraFlash}
                />
                <MainRowActions
                  testID={"main-row-actions"}
                  isRecording={isRecording}
                  handleTakePicture={toggleRecord}
                  disabled={!cameraReady}
                />
                <BottomRowTools />
              </View>
            </SafeAreaView>
          </CameraView>
        </TapGestureHandler>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}
