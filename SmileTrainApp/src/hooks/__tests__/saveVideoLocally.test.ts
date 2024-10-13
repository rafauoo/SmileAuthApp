import * as FileSystem from 'expo-file-system';
import saveVideoLocally from '../saveVideoLocally'; // Adjust the path if necessary

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock/document/directory/', // Mock the document directory
  copyAsync: jest.fn(), // Explicitly mock the copyAsync function
}));

describe('saveVideoLocally', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear previous mock calls
  });

  it('should save the video locally and return the local URI', async () => {
    const mockVideoUri = 'https://example.com/path/to/video.mp4';
    const fileName = 'video.mp4';
    const expectedLocalUri = `${FileSystem.documentDirectory}${fileName}`;

    // Mock the implementation of copyAsync
    (FileSystem.copyAsync as jest.Mock).mockResolvedValue(undefined); // Simulate successful copy

    const result = await saveVideoLocally(mockVideoUri);

    // Check if copyAsync was called with the correct arguments
    expect(FileSystem.copyAsync).toHaveBeenCalledWith({
      from: mockVideoUri,
      to: expectedLocalUri,
    });

    // Check if the returned local URI is correct
    expect(result).toBe(expectedLocalUri);
  });

  it('should return null if the videoUri is null', async () => {
    const result = await saveVideoLocally(null);
    
    // No need to call copyAsync
    expect(FileSystem.copyAsync).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should handle errors and return null', async () => {
    const mockVideoUri = 'https://example.com/path/to/video.mp4';
    
    // Mock the implementation of copyAsync to throw an error
    (FileSystem.copyAsync as jest.Mock).mockRejectedValue(new Error('Copy failed'));

    const result = await saveVideoLocally(mockVideoUri);

    // Check if copyAsync was called with the correct arguments
    expect(FileSystem.copyAsync).toHaveBeenCalledWith({
      from: mockVideoUri,
      to: `${FileSystem.documentDirectory}${mockVideoUri.split('/').pop()}`,
    });

    // Check that the function returns null on error
    expect(result).toBeNull();
  });
});
