import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from "expo-file-system";
import { deleteEvaluation } from '../deleteEvaluation';
import { fetchHistory } from '../fetchHistory';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-file-system');
jest.mock('../fetchHistory');

describe('deleteEvaluation', () => {
    const mockDate = '2024-10-10';
    const mockVideoUri = 'file:///path/to/video.mp4';
    const mockHistory = [
        { date: '2024-10-10', video: mockVideoUri },
        { date: '2024-10-11', video: null },
    ];

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
    });

    it('should delete the evaluation and video file if it exists', async () => {
        (fetchHistory as jest.Mock).mockResolvedValue(mockHistory);
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });

        const updatedHistory = await deleteEvaluation(mockDate);

        expect(FileSystem.deleteAsync).toHaveBeenCalledWith(mockVideoUri, { idempotent: true });
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('evaluationHistory', JSON.stringify([{ date: '2024-10-11', video: null }]));
        expect(updatedHistory).toEqual([{ date: '2024-10-11', video: null }]);
    });

    it('should not attempt to delete video if it does not exist', async () => {
        (fetchHistory as jest.Mock).mockResolvedValue(mockHistory);
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });

        const updatedHistory = await deleteEvaluation(mockDate);

        expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('evaluationHistory', JSON.stringify([{ date: '2024-10-11', video: null }]));
        expect(updatedHistory).toEqual([{ date: '2024-10-11', video: null }]);
    });

    it('should handle errors when deleting video file', async () => {
        (fetchHistory as jest.Mock).mockResolvedValue(mockHistory);
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
        (FileSystem.deleteAsync as jest.Mock).mockRejectedValue(new Error('Failed to delete'));

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        const updatedHistory = await deleteEvaluation(mockDate);

        expect(consoleErrorSpy).toHaveBeenCalledWith("Error deleting video file:", expect.any(Error));
        expect(updatedHistory).toEqual([{ date: '2024-10-11', video: null }]);

        consoleErrorSpy.mockRestore();
    });

    it('should not find a matching evaluation if date does not exist', async () => {
        const newDate = '2024-10-12'; // Date that does not exist in mockHistory
        (fetchHistory as jest.Mock).mockResolvedValue(mockHistory);

        const updatedHistory = await deleteEvaluation(newDate);

        expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('evaluationHistory', JSON.stringify(mockHistory));
        expect(updatedHistory).toEqual(mockHistory);
    });
});
