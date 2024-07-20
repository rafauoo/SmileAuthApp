import * as React from "react";
import { SymbolView } from "expo-symbols";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Colors } from "@/src/constants/Colors";
import { CameraMode } from "expo-camera";

interface MainRowActionsProps {
  handleTakePicture: () => void;
  cameraMode: CameraMode;
  isRecording: boolean;
}

export default function MainRowActions({
  cameraMode,
  handleTakePicture,
  isRecording,
}: MainRowActionsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleTakePicture} style={styles.button}>
        <SymbolView
          name={
            cameraMode === "picture"
              ? "circle"
              : isRecording
              ? "record.circle"
              : "circle.circle"
          }
          size={90}
          type="hierarchical"
          style={{ marginLeft: 13 }}
          tintColor={isRecording ? Colors.light.snapPrimary : "white"}
          animationSpec={{
            effect: {
              type: isRecording ? "pulse" : "bounce",
            },
            repeating: isRecording,
          }}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 100, // Ensure the height is defined for centering in vertical direction
    position: "absolute",
    bottom: 50,
    alignItems: "center", // Centers child elements horizontally
    justifyContent: "center", // Centers child elements vertically
  },
  button: {
    alignItems: "center", // Centers icon within TouchableOpacity
    justifyContent: "center", // Centers icon within TouchableOpacity
  },
});
