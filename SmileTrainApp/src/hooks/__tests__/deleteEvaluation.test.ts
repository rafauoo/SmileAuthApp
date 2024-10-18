import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { deleteEvaluation } from '../deleteEvaluation';
import { fetchHistory } from '../fetchHistory';
import Evaluation from '../../interfaces/Evaluation';

jest.mock('../fetchHistory');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-file-system');

describe('deleteEvaluation', () => {
    const mockEvaluations: Evaluation[] = [
        {
          score: 85,
          comment: { pl: "Dobry wynik", en: "Good score" },
          date: "2024-10-17T10:00:00Z",
          video: "video-url-1",
        },
        {
          score: 92,
          comment: { pl: "Świetny wynik", en: "Great score" },
          date: "2024-10-18T11:00:00Z",
          video: "video-url-2",
        },
      ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should delete an evaluation and its associated video', async () => {
        (fetchHistory as jest.Mock).mockResolvedValue({ success: true, evaluations: mockEvaluations });
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
        (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);
        (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

        const result = await deleteEvaluation("2024-10-18T11:00:00Z");

        expect(result).toEqual({
            success: true,
            updatedHistory: [{
                score: 85,
                comment: { pl: "Dobry wynik", en: "Good score" },
                date: "2024-10-17T10:00:00Z",
                video: "video-url-1",
              }],
        });
        expect(FileSystem.deleteAsync).toHaveBeenCalledWith("video-url-2", { idempotent: true });
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('evaluationHistory', JSON.stringify([{
            score: 85,
            comment: { pl: "Dobry wynik", en: "Good score" },
            date: "2024-10-17T10:00:00Z",
            video: "video-url-1",
    }]));
    });

    it('should return success false if fetchHistory fails', async () => {
        (fetchHistory as jest.Mock).mockResolvedValue({ success: false });

        const result = await deleteEvaluation("2024-10-18T11:00:00Z");

        expect(result).toEqual({ success: false });
        expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
    });

    it('should handle a case where the video file does not exist', async () => {
        (fetchHistory as jest.Mock).mockResolvedValue({ success: true, evaluations: mockEvaluations });
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });
        (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

        const result = await deleteEvaluation("2024-10-18T11:00:00Z");

        expect(result).toEqual({
            success: true,
            updatedHistory: [{
                score: 85,
                comment: { pl: "Dobry wynik", en: "Good score" },
                date: "2024-10-17T10:00:00Z",
                video: "video-url-1",
              }],
        });
        expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
    });

    it('should handle a case where the evaluation to delete does not have a video', async () => {
        const mockEvaluations: Evaluation[] = [
            {
              score: 85,
              comment: { pl: "Dobry wynik", en: "Good score" },
              date: "2024-10-17T10:00:00Z",
              video: null
            },
            {
              score: 92,
              comment: { pl: "Świetny wynik", en: "Great score" },
              date: "2024-10-18T11:00:00Z",
              video: null
            },
          ];
        (fetchHistory as jest.Mock).mockResolvedValue({ success: true, evaluations: mockEvaluations });
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });
        (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

        const result = await deleteEvaluation("2024-10-18T11:00:00Z");

        expect(result).toEqual({
            success: true,
            updatedHistory: [{
                score: 85,
                comment: { pl: "Dobry wynik", en: "Good score" },
                date: "2024-10-17T10:00:00Z",
                video: null
              }],
        });
        expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
    });

    it('should return success false if an error occurs', async () => {
        (fetchHistory as jest.Mock).mockRejectedValue(new Error('Some error'));

        const result = await deleteEvaluation("2024-10-18T11:00:00Z");

        expect(result).toEqual({ success: false });
    });

    it('should return success false if an error occurs that is not an instance of Error', async () => {
        (fetchHistory as jest.Mock).mockResolvedValue({ success: true, evaluations: mockEvaluations });
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });

        const errorMessage = 'This is a string error';
        jest.spyOn(FileSystem, 'getInfoAsync').mockRejectedValue(errorMessage);
    
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
        const result = await deleteEvaluation("2024-10-18T11:00:00Z");
    
        expect(result).toEqual({ success: false });
        expect(consoleErrorSpy).toHaveBeenCalledWith("An unknown error occurred while deleting evaluation:", errorMessage);

        consoleErrorSpy.mockRestore();
    });
});
