import Evaluation from "../interfaces/Evaluation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveEvaluation } from "./saveEvaluation";
export async function fetchHistory() {
  try {
    saveEvaluation(90, "koment", "");
    const storedHistory = await AsyncStorage.getItem("evaluationHistory");
    console.log(storedHistory);
    if (storedHistory) {
      const evaluations: Evaluation[] = JSON.parse(storedHistory);
      evaluations.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return evaluations;
    }
  } catch (error) {
    console.error("Failed to fetch evaluation history: ", error);
  }
  return [];
}
