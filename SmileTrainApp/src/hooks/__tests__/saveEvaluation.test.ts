import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveEvaluation } from '../saveEvaluation';
import saveVideoLocally from '../saveVideoLocally';
import Evaluation from '@/src/interfaces/Evaluation';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('../saveVideoLocally'); // Mock saveVideoLocally function

describe('saveEvaluation', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear previous mock calls
  });

  it('should save a new evaluation and update the evaluation history', async () => {
    const mockVideoPath = 'path/to/video.mp4';
    const mockLocalVideoUri = 'local/path/to/video.mp4';
    const mockCurrentHistory: Evaluation[] = [
      { score: 90, comment: 'Great!', date: '2023-10-12', video: mockLocalVideoUri },
    ];

    // Mock implementations
    (saveVideoLocally as jest.Mock).mockResolvedValue(mockLocalVideoUri);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockCurrentHistory));

    const score = 85;
    const comment = 'Good';
    const date = await saveEvaluation(score, comment, mockVideoPath);

    // Verify that the new evaluation was added
    const updatedHistory = [...mockCurrentHistory, {
      score,
      comment,
      date,
      video: mockLocalVideoUri,
    }];

    // Check if AsyncStorage.setItem was called with the updated history
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "evaluationHistory",
      JSON.stringify(updatedHistory)
    );

    // Check if the date returned is a string
    expect(typeof date).toBe('string');
  });

  it('should create a new history if there is no existing history', async () => {
    const mockVideoPath = 'path/to/video.mp4';
    const mockLocalVideoUri = 'local/path/to/video.mp4';

    // Mock implementations
    (saveVideoLocally as jest.Mock).mockResolvedValue(mockLocalVideoUri);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null); // No existing history

    const score = 75;
    const comment = 'Average';
    const date = await saveEvaluation(score, comment, mockVideoPath);

    // Check if AsyncStorage.setItem was called with the new history
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "evaluationHistory",
      JSON.stringify([{
        score,
        comment,
        date,
        video: mockLocalVideoUri,
      }])
    );

    // Check if the date returned is a string
    expect(typeof date).toBe('string');
  });

  it('should handle errors when saving an evaluation', async () => {
    const mockVideoPath = 'path/to/video.mp4';

    // Mock implementations
    (saveVideoLocally as jest.Mock).mockRejectedValue(new Error('Video save error'));
    
    const score = 85;
    const comment = 'Good';
    const date = await saveEvaluation(score, comment, mockVideoPath);

    // Check if AsyncStorage.setItem was not called due to the error
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();

    // Check if the date returned is undefined since saving failed
    expect(date).toBeUndefined();
  });
});
