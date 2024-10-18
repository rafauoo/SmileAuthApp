import AsyncStorage from "@react-native-async-storage/async-storage";
import saveVideoLocally from "./saveVideoLocally";
import Evaluation from "../interfaces/Evaluation";
import { CommentData } from "../interfaces/CommentData";

export async function saveEvaluation(
  score: number,
  comment: CommentData,
  videoPath: string | null
): Promise<{ success: boolean; date?: string; videoSaveSuccess?: boolean }> {
  try {
    const localVideoUri_res = await saveVideoLocally(videoPath);
    const currentHistory = await AsyncStorage.getItem("evaluationHistory");
    const history: Evaluation[] = currentHistory
      ? JSON.parse(currentHistory)
      : [];
    const dateNow = new Date(Date.now())
    const date = dateNow.toISOString();
    const newEvaluation: Evaluation = {
      score,
      comment,
      date,
      video: localVideoUri_res.localUri ? localVideoUri_res.localUri : null,
    };
    history.push(newEvaluation);
    await AsyncStorage.setItem("evaluationHistory", JSON.stringify(history));
    return { success: true, date: date, videoSaveSuccess: localVideoUri_res.success };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Failed to save evaluation: ", error.message);
      return { success: false }
    } else {
      console.error("An unknown error occurred while saving evaluation:", error);
      return { success: false };
    }
  }
}
