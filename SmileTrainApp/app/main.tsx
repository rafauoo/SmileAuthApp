import * as React from "react";
import { SafeAreaView, View } from "react-native";
import { TapGestureHandler, State } from "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import {
  BarcodeScanningResult,
  CameraMode,
  CameraView,
  FlashMode,
} from "expo-camera";
import BottomRowTools from "@/src/components/BottomRowTools";
import MainRowActions from "@/src/components/MainRowActions";
import PictureView from "@/src/components/PictureView";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import CameraTools from "@/src/components/CameraTools";
import VideoViewComponent from "@/src/components/VideoView";

export default function HomeScreen() {
  const cameraRef = React.useRef<CameraView>(null);
  const [cameraMode, setCameraMode] = React.useState<CameraMode>("picture");
  const [cameraTorch, setCameraTorch] = React.useState<boolean>(false);
  const [cameraFlash, setCameraFlash] = React.useState<FlashMode>("off");
  const [cameraFacing, setCameraFacing] = React.useState<"front" | "back">(
    "back"
  );
  const [cameraZoom, setCameraZoom] = React.useState<number>(0);
  const [picture, setPicture] = React.useState<string>("");
  const [video, setVideo] = React.useState<string>("");

  const [isRecording, setIsRecording] = React.useState<boolean>(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  async function handleTakePicture() {
    const response = await cameraRef.current?.takePictureAsync({});
    setPicture(response!.uri);
  }

  async function toggleRecord() {
    if (isRecording) {
      cameraRef.current?.stopRecording();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      const response = await cameraRef.current?.recordAsync();
      setVideo(response!.uri);
    }
  }

  function handleDoubleTap(event) {
    if (event.nativeEvent.state === State.ACTIVE) {
      setCameraFacing((prev) => (prev === "back" ? "front" : "back"));
    }
  }

  if (picture) return <PictureView picture={picture} setPicture={setPicture} />;
  if (video) return <VideoViewComponent video={video} setVideo={setVideo} />;
  return (
    <Animated.View
      layout={LinearTransition}
      entering={FadeIn.duration(1000)}
      exiting={FadeOut.duration(1000)}
      style={{ flex: 1 }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TapGestureHandler
          onHandlerStateChange={handleDoubleTap}
          numberOfTaps={2}
        >
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing={cameraFacing}
            mode={cameraMode}
            zoom={cameraZoom}
            enableTorch={cameraTorch}
            flash={cameraFlash}
            onCameraReady={() => console.log("camera is ready")}
          >
            <SafeAreaView style={{ flex: 1 }}>
              <View style={{ flex: 1, padding: 6 }}>
                <CameraTools
                  cameraZoom={cameraZoom}
                  cameraFlash={cameraFlash}
                  cameraTorch={cameraTorch}
                  setCameraZoom={setCameraZoom}
                  setCameraFacing={setCameraFacing}
                  setCameraTorch={setCameraTorch}
                  setCameraFlash={setCameraFlash}
                />
                <MainRowActions
                  isRecording={isRecording}
                  handleTakePicture={
                    cameraMode === "picture" ? handleTakePicture : toggleRecord
                  }
                  cameraMode={cameraMode}
                />
                <BottomRowTools
                  cameraMode={cameraMode}
                  setCameraMode={setCameraMode}
                />
              </View>
            </SafeAreaView>
          </CameraView>
        </TapGestureHandler>
      </GestureHandlerRootView>
    </Animated.View>
  );
}
