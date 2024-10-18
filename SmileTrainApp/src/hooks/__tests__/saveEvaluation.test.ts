import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveEvaluation } from '../saveEvaluation';
import saveVideoLocally from '../saveVideoLocally';
import Evaluation from '../../interfaces/Evaluation';
import { CommentData } from '../../interfaces/CommentData';
import moment from 'moment';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('../saveVideoLocally');
const fixedDate = moment("2024-12-31").valueOf();

describe("saveEvaluation", () => {
    const consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => {});

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Date, "now").mockImplementation(() => fixedDate);
    });

    it('should save an evaluation successfully', async () => {
        const mockVideoPath = 'mock/video/path';
        const mockComment: CommentData = { pl: 'Doskonały wynik', en: 'Excellent score' };
        const mockVideoSaveResult = { success: true, localUri: 'local/video/uri' };

        (saveVideoLocally as jest.Mock).mockResolvedValue(mockVideoSaveResult);
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

        const result = await saveEvaluation(90, mockComment, mockVideoPath);

        expect(result).toEqual({
            success: true,
            date: "2024-12-30T23:00:00.000Z",
            videoSaveSuccess: true,
        });

        const expectedEvaluation: Evaluation = {
            score: 90,
            comment: mockComment,
            date: "2024-12-30T23:00:00.000Z",
            video: mockVideoSaveResult.localUri,
        };

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
            'evaluationHistory',
            JSON.stringify([expectedEvaluation])
        );
    });

    it('should append to existing evaluation history', async () => {
        const mockVideoPath = 'mock/video/path';
        const mockComment: CommentData = { pl: 'Doskonały wynik', en: 'Excellent score' };
        const mockVideoSaveResult = { success: true, localUri: 'local/video/uri' };
        const existingHistory: Evaluation[] = [
            {
                score: 80,
                comment: { pl: 'Dobry wynik', en: 'Good score' },
                date: '2024-10-17T10:00:00Z',
                video: 'existing/video/uri',
            },
        ];

        (saveVideoLocally as jest.Mock).mockResolvedValue(mockVideoSaveResult);
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingHistory));
        (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

        const result = await saveEvaluation(90, mockComment, mockVideoPath);

        expect(result).toEqual({
            success: true,
            date: "2024-12-30T23:00:00.000Z",
            videoSaveSuccess: true,
        });

        const expectedEvaluation: Evaluation = {
            score: 90,
            comment: mockComment,
            date: "2024-12-30T23:00:00.000Z",
            video: mockVideoSaveResult.localUri,
        };

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
            'evaluationHistory',
            JSON.stringify([...existingHistory, expectedEvaluation])
        );
    });

    it('should return success false if saveVideoLocally fails', async () => {
        const mockVideoPath = 'mock/video/path';
        const mockComment: CommentData = { pl: 'Doskonały wynik', en: 'Excellent score' };

        (saveVideoLocally as jest.Mock).mockResolvedValue({ success: false });
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

        const result = await saveEvaluation(90, mockComment, mockVideoPath);

        expect(result).toEqual({
            success: true,
            date: "2024-12-30T23:00:00.000Z",
            videoSaveSuccess: false,
        });
    });

    it('should return success false if an error occurs', async () => {
        const mockVideoPath = 'mock/video/path';
        const mockComment: CommentData = { pl: 'Doskonały wynik', en: 'Excellent score' };

        (saveVideoLocally as jest.Mock).mockResolvedValue({ success: true, localUri: 'local/video/uri' });
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('AsyncStorage error'));

        const result = await saveEvaluation(90, mockComment, mockVideoPath);

        expect(result).toEqual({ success: false });
        expect(consoleErrorMock).toHaveBeenCalledWith("Failed to save evaluation: ", "AsyncStorage error");
    });

    it('should handle unknown errors when saving', async () => {
        const mockVideoPath = 'mock/video/path';
        const mockComment: CommentData = { pl: 'Doskonały wynik', en: 'Excellent score' };

        (saveVideoLocally as jest.Mock).mockResolvedValue({ success: true, localUri: 'local/video/uri' });
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        (AsyncStorage.setItem as jest.Mock).mockRejectedValue('This is a string error');

        const result = await saveEvaluation(90, mockComment, mockVideoPath);

        expect(result).toEqual({ success: false });
        expect(consoleErrorMock).toHaveBeenCalledWith("An unknown error occurred while saving evaluation:", 'This is a string error');
    });
});
