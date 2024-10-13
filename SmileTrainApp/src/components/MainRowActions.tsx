import * as React from "react";
import { SymbolView } from "expo-symbols";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Colors } from "@/src/constants/Colors";

interface MainRowActionsProps {
  handleTakePicture: () => void;
  isRecording: boolean;
}

export default function MainRowActions({
  handleTakePicture,
  isRecording,
}: MainRowActionsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleTakePicture} style={styles.button}>
        <SymbolView
          name={isRecording ? "record.circle" : "circle.circle"}
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
    height: 100,
    position: "absolute",
    bottom: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
});
