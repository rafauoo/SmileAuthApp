import * as React from "react";
import { SymbolView } from "expo-symbols";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface MainRowActionsProps {
  handleTakePicture: () => void;
  disabled: boolean;
  testID?: string;
  isRecording: boolean;
}

export default function MainRowActions({
  handleTakePicture,
  disabled,
  testID,
  isRecording,
}: MainRowActionsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleTakePicture}
        style={styles.button}
        testID={testID}
      >
        <SymbolView
          name={isRecording ? "record.circle" : "circle.circle"}
          size={90}
          type="hierarchical"
          testID="main-row-actions-icon"
          style={{ marginLeft: 13, opacity: disabled ? 0.5 : 1 }}
          tintColor={isRecording ? "#FFFC00" : "white"}
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
