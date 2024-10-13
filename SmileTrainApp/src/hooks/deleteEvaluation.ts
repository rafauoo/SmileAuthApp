import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from "expo-file-system";
import { fetchHistory } from './fetchHistory';

export async function deleteEvaluation(date: string) {
    const history = await fetchHistory();
    const updatedHistory = history.filter(item => item.date.toString() !== date);
    const itemToDelete = history.filter(item => item.date.toString() === date)[0];
    if (itemToDelete?.video) {
        try {
            const videoUri = itemToDelete.video;
            const fileInfo = await FileSystem.getInfoAsync(videoUri);
            if (fileInfo.exists) {
                await FileSystem.deleteAsync(videoUri, { idempotent: true });
                console.log(`Video deleted: ${videoUri}`);
            } else {
                console.log("Video file does not exist.");
            }
        } catch (error) {
            console.error("Error deleting video file:", error);
        }
    }

    await AsyncStorage.setItem('evaluationHistory', JSON.stringify(updatedHistory));
    return updatedHistory
}