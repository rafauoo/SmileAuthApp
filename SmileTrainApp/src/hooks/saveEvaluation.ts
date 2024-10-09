import AsyncStorage from "@react-native-async-storage/async-storage";
import saveVideoLocally from "./saveVideoLocally";
import Evaluation from "../interfaces/Evaluation";

export async function saveEvaluation(
  score: number,
  comment: string,
  videoPath: string | null
) {
  try {
    const localVideoUri = await saveVideoLocally(videoPath);
    const currentHistory = await AsyncStorage.getItem("evaluationHistory");
    const history: Evaluation[] = currentHistory
      ? JSON.parse(currentHistory)
      : [];
    const date = new Date().toString();
    const newEvaluation: Evaluation = {
      score,
      comment,
      date,
      video: localVideoUri,
    };
    history.push(newEvaluation);
    await AsyncStorage.setItem("evaluationHistory", JSON.stringify(history));
    return date.toString();
  } catch (error) {
    console.error("Failed to save evaluation: ", error);
  }
}
