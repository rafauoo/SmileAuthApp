import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveEvaluation(score: number, comment: string) {
    try {
        const currentHistory = await AsyncStorage.getItem('evaluationHistory');
        const history = currentHistory ? JSON.parse(currentHistory) : [];
        const date = new Date()
        const newEvaluation = { score, comment, date };
        history.push(newEvaluation);
        await AsyncStorage.setItem('evaluationHistory', JSON.stringify(history));
        return date.toString()
    } catch (error) {
        console.error("Failed to save evaluation: ", error);
    }
}