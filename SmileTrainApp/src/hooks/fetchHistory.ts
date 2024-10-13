import Evaluation from "../interfaces/Evaluation";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function fetchHistory() {
  try {
    const storedHistory = await AsyncStorage.getItem("evaluationHistory");
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
