import * as React from "react";
import { StyleSheet, View } from "react-native";
import IconButton from "./IconButton";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { deleteEvaluation } from "../hooks/deleteEvaluation";
import { useTranslation } from "react-i18next";

export default function BottomRowScore({ date }: { date: string | undefined }) {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const handleGoBack = () => {
    router.push("/menu");
  };

  async function handleDelete(date: string | undefined) {
    if (date) {
      Alert.alert(
        t("screens.menu.deleteAlert.title"),
        t("screens.menu.deleteAlert.desc"),
        [
          {
            text: t("screens.menu.deleteAlert.cancel"),
            style: "cancel",
          },
          {
            text: t("screens.menu.deleteAlert.ok"),
            onPress: async () => {
              const result = await deleteEvaluation(date);
              if (!result.success) {
                Alert.alert(
                  t("exceptions.title"),
                  t("exceptions.deleteEvaluation"),
                  [
                    {
                      text: t("screens.menu.deleteAlert.okay"),
                    },
                  ]
                );
                return;
              }
              router.push("/menu");
            },
          },
        ]
      );
    }
  }

  return (
    <View style={styles.bottomRow}>
      <View style={styles.bottomRowLeft}>
        <IconButton
          testID="iconButton-back"
          onPress={handleGoBack}
          iosName={"list.bullet"}
          androidName="home"
          color="white"
          bgColor="#FF8940"
          containerPadding={15}
          containerWidth={70}
          iconSize={40}
        />
      </View>
      <View style={styles.bottomRowRight}>
        <IconButton
          testID="iconButton-delete"
          onPress={() => handleDelete(date)}
          iosName={"trash"}
          androidName="trash"
          bgColor="#FF8940"
          color="white"
          containerPadding={15}
          containerWidth={70}
          iconSize={40}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomRow: {
    position: "absolute",
    flexDirection: "row",
    width: "100%",
    alignSelf: "center",
    bottom: 30,
  },
  bottomRowLeft: {
    width: "50%",
    alignItems: "flex-start",
  },
  bottomRowRight: {
    width: "50%",
    alignItems: "flex-end",
  },
});
