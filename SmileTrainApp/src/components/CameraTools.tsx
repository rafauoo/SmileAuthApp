import { View, StyleSheet } from "react-native";
import IconButton from "./IconButton";
import { FlashMode } from "expo-camera";

interface CameraToolsProps {
  cameraZoom: number;
  cameraFlash: FlashMode;
  cameraTorch: boolean;
  setCameraZoom: React.Dispatch<React.SetStateAction<number>>;
  setCameraFacing: React.Dispatch<React.SetStateAction<"front" | "back">>;
  setCameraTorch: React.Dispatch<React.SetStateAction<boolean>>;
  setCameraFlash: React.Dispatch<React.SetStateAction<FlashMode>>;
}
export default function CameraTools({
  cameraFlash,
  cameraTorch,
  setCameraFacing,
  setCameraTorch,
  setCameraFlash,
}: CameraToolsProps) {
  return (
    <View style={styles.container}>
      <IconButton
        onPress={() => setCameraTorch((prevValue) => !prevValue)}
        iosName={
          cameraTorch ? "flashlight.off.circle" : "flashlight.slash.circle"
        }
        androidName="flash"
      />
      <IconButton
        onPress={() =>
          setCameraFacing((prevValue) =>
            prevValue === "back" ? "front" : "back"
          )
        }
        iosName={"arrow.triangle.2.circlepath.camera"}
        androidName="close"
        width={25}
        height={21}
      />
      <IconButton
        onPress={() =>
          setCameraFlash((prevValue) => (prevValue === "off" ? "on" : "off"))
        }
        iosName={cameraFlash === "on" ? "bolt.circle" : "bolt.slash.circle"}
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
