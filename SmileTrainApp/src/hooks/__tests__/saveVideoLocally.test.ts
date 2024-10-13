import * as FileSystem from 'expo-file-system';
import saveVideoLocally from '../saveVideoLocally';

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock/document/directory/',
  copyAsync: jest.fn(),
}));

describe('saveVideoLocally', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save the video locally and return the local URI', async () => {
    const mockVideoUri = 'https://example.com/path/to/video.mp4';
    const fileName = 'video.mp4';
    const expectedLocalUri = `${FileSystem.documentDirectory}${fileName}`;

    (FileSystem.copyAsync as jest.Mock).mockResolvedValue(undefined); 

    const result = await saveVideoLocally(mockVideoUri);

    expect(FileSystem.copyAsync).toHaveBeenCalledWith({
      from: mockVideoUri,
      to: expectedLocalUri,
    });

    expect(result).toBe(expectedLocalUri);
  });

  it('should return null if the videoUri is null', async () => {
    const result = await saveVideoLocally(null);
    
    expect(FileSystem.copyAsync).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should handle errors and return null', async () => {
    const mockVideoUri = 'https://example.com/path/to/video.mp4';
    
    (FileSystem.copyAsync as jest.Mock).mockRejectedValue(new Error('Copy failed'));

    const result = await saveVideoLocally(mockVideoUri);

    expect(FileSystem.copyAsync).toHaveBeenCalledWith({
      from: mockVideoUri,
      to: `${FileSystem.documentDirectory}${mockVideoUri.split('/').pop()}`,
    });

    expect(result).toBeNull();
  });
});
