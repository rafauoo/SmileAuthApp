import AsyncStorage from '@react-native-async-storage/async-storage';

interface Evaluation {
    score: number;
    comment: string;
    date: string;
  }

export async function deleteEvaluation(history: Evaluation[], date: string) {
    const updatedHistory = history.filter(item => item.date.toString() !== date);
    await AsyncStorage.setItem('evaluationHistory', JSON.stringify(updatedHistory));
    return updatedHistory
}