import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from "expo-file-system";
import Evaluation from '../interfaces/Evaluation';
import { fetchHistory } from './fetchHistory';

export async function deleteEvaluation(date: string): Promise<{ success: boolean; updatedHistory?: Evaluation[]}> {
    try {
        const result = await fetchHistory();
        if (!result.success || !result.evaluations) {
            console.log("Failed to fetch evaluations.");
            return { success: false };
        }
        const updatedHistory = result.evaluations.filter(item => item.date.toString() !== date);
        const itemToDelete = result.evaluations.find(item => item.date.toString() === date);

        if (itemToDelete?.video) {
            const videoUri = itemToDelete.video;
            const fileInfo = await FileSystem.getInfoAsync(videoUri);

            if (fileInfo.exists) {
                await FileSystem.deleteAsync(videoUri, { idempotent: true });
                console.log(`Video deleted: ${videoUri}`);
            } else {
                console.log("Video file does not exist.");
        
            }
        } else {
            console.log("No video found for this evaluation.");
        }

        await AsyncStorage.setItem('evaluationHistory', JSON.stringify(updatedHistory));
        return { success: true, updatedHistory };
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error deleting evaluation:", error.message);
            return { success: false };
        } else {
            console.error("An unknown error occurred while deleting evaluation:", error);
            return { success: false };
        }
    }
}
