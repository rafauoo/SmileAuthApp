import { View, StyleSheet } from "react-native";
import IconButton from "./IconButton";
import React from "react";

interface CameraToolsProps {
  cameraFlash: boolean;
  setCameraFacing: React.Dispatch<React.SetStateAction<"front" | "back">>;
  setCameraFlash: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function CameraTools({
  cameraFlash,
  setCameraFacing,
  setCameraFlash,
}: CameraToolsProps) {
  return (
    <View style={styles.container}>
      <IconButton
        containerPadding={10}
        containerWidth={50}
        testID="iconButton-toggle-camera"
        iconSize={30}
        color="white"
        onPress={() =>
          setCameraFacing((prevValue) =>
            prevValue === "back" ? "front" : "back"
          )
        }
        iosName={"arrow.2.circlepath"}
        androidName="camera-reverse-outline"
      />
      <IconButton
        containerPadding={10}
        containerWidth={50}
        testID="iconButton-toggle-flash"
        iconSize={30}
        color="white"
        onPress={() =>
          setCameraFlash((prevValue) => (prevValue === false ? true : false))
        }
        iosName={cameraFlash === true ? "bolt.circle" : "bolt.slash.circle"}
        androidName={cameraFlash === true ? "flash" : "flash-off"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 100,
  },
});
