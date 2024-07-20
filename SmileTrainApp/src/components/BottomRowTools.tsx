import * as React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import IconButton from "./IconButton";
import { Link } from "expo-router";
import { ThemedText } from "./ThemedText";
import { CameraMode } from "expo-camera";

interface BottomRowToolsProps {
  cameraMode: CameraMode;
  setCameraMode: React.Dispatch<React.SetStateAction<CameraMode>>;
}
export default function BottomRowTools({
  cameraMode,
  setCameraMode,
}: BottomRowToolsProps) {
  return (
    <View style={[styles.bottomContainer, styles.directionRowItemsCenter]}>
      <Link href={"/menu"} asChild>
        <IconButton androidName="menu" iosName="list.bullet" />
      </Link>
      <View style={styles.directionRowItemsCenterToggle}>
        <TouchableOpacity
          onPress={() => setCameraMode("picture")}
          style={styles.bottomButton}
        >
          <ThemedText
            style={{
              fontWeight: cameraMode === "picture" ? "bold" : "100",
            }}
          >
            Photo
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setCameraMode("video")}
          style={styles.bottomButton}
        >
          <ThemedText
            style={{
              fontWeight: cameraMode === "video" ? "bold" : "100",
            }}
          >
            Video
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  directionRowItemsCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 94,
  },
  directionRowItemsCenterToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bottomContainer: {
    width: "100%",
    position: "absolute",
    alignSelf: "center",
    alignItems: "center",
    bottom: 6,
    left: 10,
  },
  bottomButton: {
    borderWidth: 5,
    width: 50,
    borderRadius: 8,
    borderColor: "#ffff",
    backgroundColor: "#ffff",
  },
});
