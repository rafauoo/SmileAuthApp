import * as React from "react";
import { StyleSheet, View } from "react-native";
import IconButton from "./IconButton";
import { useRouter } from "expo-router";

export default function BottomRowTools() {
  const router = useRouter();

  const goToMenu = () => {
    router.push("/menu"); // Przejście do nowego ekranu z domyślną animacją z lewej strony
  };

  return (
    <View style={[styles.bottomContainer, styles.directionRowItemsCenter]}>
      <IconButton containerPadding={10} containerWidth={50} iconSize={30} androidName="menu" iosName="list.bullet" onPress={goToMenu} color="white"/>
    </View>
  );
}

const styles = StyleSheet.create({
  directionRowItemsCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 94,
  },
  bottomContainer: {
    width: "100%",
    position: "absolute",
    alignSelf: "center",
    alignItems: "center",
    bottom: 6,
    left: 10,
  },
});
