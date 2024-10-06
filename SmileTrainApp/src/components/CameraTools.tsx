import { View, StyleSheet } from "react-native";
import IconButton from "./IconButton";
import React from 'react'

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
        containerPadding={10} containerWidth={50} iconSize={30}
        color="white"
        onPress={() =>
          setCameraFacing((prevValue) =>
            prevValue === "back" ? "front" : "back"
          )
        }
        iosName={"arrow.triangle.2.circlepath.camera"}
        androidName="close"
      />
      <IconButton
        containerPadding={10} containerWidth={50} iconSize={30}
        color="white"
        onPress={() =>
          setCameraFlash((prevValue) => (prevValue === false ? true : false))
        }
        iosName={cameraFlash === true ? "bolt.circle" : "bolt.slash.circle"}
        androidName="close"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 1,
    flexDirection: "row", // Ustawia ikony poziomo
    alignItems: "center", // Centruje ikony w pionie
    gap: 100, // Odstęp między ikonami
  },
});
