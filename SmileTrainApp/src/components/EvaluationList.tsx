import * as React from "react";
import { StyleSheet, View } from "react-native";
import IconButton from "./IconButton";
import { useRouter } from "expo-router";
import { TouchableOpacity, FlatList, Text } from "react-native";
import { format } from "date-fns";
import Evaluation from "../interfaces/Evaluation";

interface Props {
  history: Evaluation[];
  onDelete: (date: string) => void;
}

export default function EvaluationList({ history, onDelete }: Props) {
  const router = useRouter();

  const handleItemPress = (item: Evaluation) => {
    const score = Number(item.score);
    const comment = item.comment;
    const date = item.date;
    const video = item.video;
    router.push({
      pathname: "/score",
      params: { score: score.toString(), comment, date, video },
    });
  };

  return (
    <FlatList
      data={history}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.item}
          onPress={() => handleItemPress(item)}
        >
          <View style={styles.itemContent}>
            <Text style={styles.scoreText}>
              {(Math.round(item.score * 100) / 100).toFixed(2)}%
            </Text>
            <Text style={styles.commentText}>{item.comment}</Text>
            <Text style={styles.dateText}>
              {format(new Date(item.date), "dd/MM/yyyy, H:mm:ss")}
            </Text>
          </View>
          <IconButton
            onPress={() => onDelete(item.date)}
            iosName={"trash"}
            androidName="trash"
            bgColor="#FF8940"
            color="white"
            containerPadding={10}
            containerWidth={50}
            iconSize={30}
          />
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  itemContent: {
    flex: 1,
    paddingRight: 10,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  commentText: {
    fontSize: 16,
    color: "#555",
  },
  dateText: {
    fontSize: 13,
    color: "#777",
  },
});
