import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchHistory } from '../fetchHistory';
import Evaluation from '../../interfaces/Evaluation';

jest.mock('@react-native-async-storage/async-storage');

describe('fetchHistory', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('should return evaluations sorted by date when history is available', async () => {
        const mockEvaluations: Evaluation[] = [
            {
                score: 90,
                comment: { pl: 'Świetny wynik', en: 'Great score' },
                date: '2024-10-17T10:00:00Z',
                video: 'video-url-1',
            },
            {
                score: 85,
                comment: { pl: 'Dobry wynik', en: 'Good score' },
                date: '2024-10-18T11:00:00Z',
                video: 'video-url-2',
            },
        ];
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockEvaluations));
        const result = await fetchHistory();
        expect(result).toEqual({
            success: true,
            evaluations: [
                {
                    score: 85,
                    comment: { pl: 'Dobry wynik', en: 'Good score' },
                    date: '2024-10-18T11:00:00Z',
                    video: 'video-url-2',
                },
                {
                    score: 90,
                    comment: { pl: 'Świetny wynik', en: 'Great score' },
                    date: '2024-10-17T10:00:00Z',
                    video: 'video-url-1',
                },
            ],
        });
    });

    it('should return an empty array when no history is available', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        const result = await fetchHistory();
        expect(result).toEqual({ success: true, evaluations: [] });
    });

    it('should handle errors when fetching history', async () => {
        const errorMessage = 'Failed to fetch';
        (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error(errorMessage));
        const result = await fetchHistory();
        expect(result).toEqual({ success: false });
        expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to fetch evaluation history: ", errorMessage);
    });

    it('should handle unknown errors when fetching history', async () => {
        const unknownError = 'This is a string error';
        (AsyncStorage.getItem as jest.Mock).mockRejectedValue(unknownError);
        const result = await fetchHistory();
        expect(result).toEqual({ success: false });
        expect(consoleErrorSpy).toHaveBeenCalledWith("An unknown error occurred while fetching evaluation history:", unknownError);
    });
});
