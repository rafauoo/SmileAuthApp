import { sendVideoToServer } from '../sendToServer'; // Adjust the import path as needed
import * as FileSystem from 'expo-file-system';
import VIDEO_API_URL from "../../config/config";
// Mock the fetch API
global.fetch = jest.fn();

jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(),
  EncodingType: {
    Base64: 'base64', // Mock the EncodingType with a sample value
  },
}));

describe('sendVideoToServer', () => {
    const mockVideoUri = 'mockVideoUri';
    
    afterEach(() => {
      jest.clearAllMocks(); // Clear mocks after each test
    });
  
    it('should send the video to the server and return success response', async () => {
      const mockResponse = { result: 75 }; // Mock the server response with a number
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('mockBase64String'); // Mock reading the video as base64
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
  
      const result = await sendVideoToServer(mockVideoUri);
  
      expect(FileSystem.readAsStringAsync).toHaveBeenCalledWith(mockVideoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      expect(global.fetch).toHaveBeenCalledWith(VIDEO_API_URL, {
        method: 'POST',
        body: JSON.stringify({ video: 'mockBase64String' }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual({ result: 75, success: true });
    });
  
    it('should handle errors and return failure response', async () => {
      (FileSystem.readAsStringAsync as jest.Mock).mockRejectedValue(new Error('File read error'));
  
      const result = await sendVideoToServer(mockVideoUri);
  
      expect(result).toEqual({ success: false });
    });
    
    it('should handle non-ok responses from server', async () => {
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('mockBase64String');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
      });
  
      const result = await sendVideoToServer(mockVideoUri);
  
      expect(result).toEqual({ success: false });
    });
  });
  
