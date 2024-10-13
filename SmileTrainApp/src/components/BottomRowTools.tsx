import * as React from "react";
import { StyleSheet, View } from "react-native";
import IconButton from "./IconButton";
import { useRouter } from "expo-router";

export default function BottomRowTools() {
  const router = useRouter();

  const goToMenu = () => {
    router.push("/menu");
  };
  const goToSettings = () => {
    router.push("/settings");
  };
  return (
    <View style={[styles.bottomContainer]}>
      <View style={[styles.bottomContainerLeft]}>
        <IconButton
          containerPadding={10}
          containerWidth={50}
          iconSize={30}
          androidName="menu"
          iosName="list.bullet"
          onPress={goToMenu}
          color="white"
        />
      </View>
      <View style={[styles.bottomContainerRight]}>
        <IconButton
          containerPadding={10}
          containerWidth={50}
          iconSize={30}
          androidName="settings-sharp"
          iosName="gear"
          onPress={goToSettings}
          color="white"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomContainer: {
    flexDirection: "row",
    width: "100%",
    position: "absolute",
    alignSelf: "center",
    alignItems: "center",
    bottom: 20,
  },
  bottomContainerLeft: {
    width: "50%",
    position: "absolute",
    alignSelf: "center",
    alignItems: "flex-start",
    left: 20,
  },
  bottomContainerRight: {
    width: "50%",
    position: "absolute",
    alignSelf: "center",
    alignItems: "flex-end",
    right: 20,
  },
});
