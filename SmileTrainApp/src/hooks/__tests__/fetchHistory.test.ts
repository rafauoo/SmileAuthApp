// fetchHistory.test.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchHistory } from '../fetchHistory';
import Evaluation from '@/src/interfaces/Evaluation';

jest.mock('@react-native-async-storage/async-storage'); // Mock AsyncStorage

describe('fetchHistory', () => {
  it('should return sorted evaluations from AsyncStorage', async () => {
    const mockEvaluations: Evaluation[] = [
      { score: 90, comment: 'Great!', date: '2023-10-12', video: 'video1' },
      { score: 85, comment: 'Good', date: '2023-10-11', video: 'video2' },
      { score: 75, comment: 'Average', date: '2023-10-13', video: 'video3' },
    ];

    // Mock implementation of AsyncStorage.getItem
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockEvaluations));

    const result = await fetchHistory();

    // Check if the result is sorted correctly
    expect(result).toEqual([
      { score: 75, comment: 'Average', date: '2023-10-13', video: 'video3' },
      { score: 90, comment: 'Great!', date: '2023-10-12', video: 'video1' },
      { score: 85, comment: 'Good', date: '2023-10-11', video: 'video2' },
    ]);
  });

  it('should return an empty array if no history is found', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null); // No data in AsyncStorage

    const result = await fetchHistory();

    expect(result).toEqual([]);
  });

  it('should return an empty array on error', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('AsyncStorage error')); // Simulate an error

    const result = await fetchHistory();

    expect(result).toEqual([]); // Ensure it returns an empty array on error
  });
});
