import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveEvaluation } from '../saveEvaluation';
import saveVideoLocally from '../saveVideoLocally';
import Evaluation from '@/src/interfaces/Evaluation';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('../saveVideoLocally');

describe('saveEvaluation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save a new evaluation and update the evaluation history', async () => {
    const mockVideoPath = 'path/to/video.mp4';
    const mockLocalVideoUri = 'local/path/to/video.mp4';
    const mockCurrentHistory: Evaluation[] = [
      { score: 90, comment: 'Great!', date: '2023-10-12', video: mockLocalVideoUri },
    ];

    (saveVideoLocally as jest.Mock).mockResolvedValue(mockLocalVideoUri);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockCurrentHistory));

    const score = 85;
    const comment = 'Good';
    const date = await saveEvaluation(score, comment, mockVideoPath);

    const updatedHistory = [...mockCurrentHistory, {
      score,
      comment,
      date,
      video: mockLocalVideoUri,
    }];

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "evaluationHistory",
      JSON.stringify(updatedHistory)
    );

    expect(typeof date).toBe('string');
  });

  it('should create a new history if there is no existing history', async () => {
    const mockVideoPath = 'path/to/video.mp4';
    const mockLocalVideoUri = 'local/path/to/video.mp4';

    (saveVideoLocally as jest.Mock).mockResolvedValue(mockLocalVideoUri);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const score = 75;
    const comment = 'Average';
    const date = await saveEvaluation(score, comment, mockVideoPath);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "evaluationHistory",
      JSON.stringify([{
        score,
        comment,
        date,
        video: mockLocalVideoUri,
      }])
    );

    expect(typeof date).toBe('string');
  });

  it('should handle errors when saving an evaluation', async () => {
    const mockVideoPath = 'path/to/video.mp4';

    (saveVideoLocally as jest.Mock).mockRejectedValue(new Error('Video save error'));
    
    const score = 85;
    const comment = 'Good';
    const date = await saveEvaluation(score, comment, mockVideoPath);

    expect(AsyncStorage.setItem).not.toHaveBeenCalled();

    expect(date).toBeUndefined();
  });
});
