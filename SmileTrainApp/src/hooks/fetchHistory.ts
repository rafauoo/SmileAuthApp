import Evaluation from "../interfaces/Evaluation";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function fetchHistory(): Promise<{ success: boolean; evaluations?: Evaluation[]}> {
  try {
    const storedHistory = await AsyncStorage.getItem("evaluationHistory");
    if (storedHistory) {
      const evaluations: Evaluation[] = JSON.parse(storedHistory);
      evaluations.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return { success: true, evaluations };
    } else {
      return { success: true, evaluations: [] };
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Failed to fetch evaluation history: ", error.message);
      return { success: false };
    } else {
      console.error("An unknown error occurred while fetching evaluation history:", error);
      return { success: false };
    }
  }
}
