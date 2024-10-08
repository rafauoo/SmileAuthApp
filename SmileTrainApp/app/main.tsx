import React from "react";
import { SafeAreaView, View } from "react-native";
import { TapGestureHandler, State, PanGestureHandler, GestureEvent } from "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import { CameraView } from "expo-camera";
import MainRowActions from "@/src/components/MainRowActions";
import CameraTools from "@/src/components/CameraTools";
import VideoViewComponent from "@/src/components/VideoView";
import BottomRowTools from "@/src/components/BottomRowTools";
import { useRouter, useFocusEffect } from "expo-router";

export default function HomeScreen() {
  const cameraRef = React.useRef<CameraView>(null);
  const [cameraTorch, setCameraTorch] = React.useState<boolean>(false);
  const [cameraFlash, setCameraFlash] = React.useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = React.useState<"front" | "back">("back");
  const [isScreenFlash, setIsScreenFlash] = React.useState<boolean>(false);
  const [cameraZoom, setCameraZoom] = React.useState<number>(0);
  const [video, setVideo] = React.useState<string>("");
  const [isRecording, setIsRecording] = React.useState<boolean>(false);
  const router = useRouter();
  const [isNavigating, setIsNavigating] = React.useState<boolean>(false);

  useFocusEffect(
    React.useCallback(() => {
      setIsNavigating(false);
    }, [])
  );

  async function toggleRecord() {
    if (isRecording) {
      cameraRef.current?.stopRecording();
      setCameraTorch(false);
      setIsScreenFlash(false);
      setIsRecording(false);
    } 
    else {
      setIsRecording(true);
      if (cameraFacing === "front") {
        setIsScreenFlash(cameraFlash);
      }
      if (cameraFacing === "back") {
        setCameraTorch(cameraFlash);
      }
      const response = await cameraRef.current?.recordAsync();
      if (response) {
        setVideo(response.uri);
      }
    }
  }

  function handleDoubleTap(event: GestureEvent) {
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


  if (video) return <VideoViewComponent video={video} setVideo={setVideo} />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler onGestureEvent={handleSwipe}>
        <TapGestureHandler onHandlerStateChange={handleDoubleTap} numberOfTaps={2}>
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing={cameraFacing}
            mode="video"
            zoom={cameraZoom}
            enableTorch={cameraTorch}
            onCameraReady={() => console.log("camera is ready")}
          >
            <SafeAreaView style={{ flex: 1, backgroundColor: isScreenFlash ? "white" : "transparent" }}>
              <View style={{ flex: 1, padding: 6 }}>
                <CameraTools
                  cameraFlash={cameraFlash}
                  setCameraFacing={setCameraFacing}
                  setCameraFlash={setCameraFlash}
                />
                <MainRowActions isRecording={isRecording} handleTakePicture={toggleRecord} />
                <BottomRowTools />
              </View>
            </SafeAreaView>
          </CameraView>
        </TapGestureHandler>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}
