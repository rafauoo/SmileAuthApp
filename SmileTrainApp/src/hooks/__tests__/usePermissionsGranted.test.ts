import { renderHook, act } from '@testing-library/react-hooks';
import usePermissionsGranted from '../usePermissionsGranted';
import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { usePermissions } from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Mocking the necessary modules
jest.mock('expo-camera', () => ({
  useCameraPermissions: jest.fn(),
  useMicrophonePermissions: jest.fn(),
}));

jest.mock('expo-media-library', () => ({
  usePermissions: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
}));

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

describe('usePermissionsGranted', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should grant permissions and set permissionsGranted to true', async () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([{ granted: true }, jest.fn()]);
    (useMicrophonePermissions as jest.Mock).mockReturnValue([{ granted: true }, jest.fn()]);
    (usePermissions as jest.Mock).mockReturnValue([{ granted: true }, jest.fn()]);

    const requestCameraPermission = jest.fn().mockResolvedValue({ granted: true });
    const requestMicrophonePermission = jest.fn().mockResolvedValue({ granted: true });
    const requestMediaLibraryPermission = jest.fn().mockResolvedValue({ granted: true });

    (useCameraPermissions as jest.Mock).mockReturnValue([{ granted: true }, requestCameraPermission]);
    (useMicrophonePermissions as jest.Mock).mockReturnValue([{ granted: true }, requestMicrophonePermission]);
    (usePermissions as jest.Mock).mockReturnValue([{ granted: true }, requestMediaLibraryPermission]);

    const { result, waitForNextUpdate } = renderHook(() => usePermissionsGranted());

    await waitForNextUpdate();

    expect(result.current).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('hasOpened', 'true');
  });

  it('should alert if camera permission is not granted', async () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([{ granted: false }, jest.fn()]);
    (useMicrophonePermissions as jest.Mock).mockReturnValue([{ granted: true }, jest.fn()]);
    (usePermissions as jest.Mock).mockReturnValue([{ granted: true }, jest.fn()]);

    const requestCameraPermission = jest.fn().mockResolvedValue({ granted: false });
    const requestMicrophonePermission = jest.fn().mockResolvedValue({ granted: true });
    const requestMediaLibraryPermission = jest.fn().mockResolvedValue({ granted: true });

    (useCameraPermissions as jest.Mock).mockReturnValue([{ granted: false }, requestCameraPermission]);
    (useMicrophonePermissions as jest.Mock).mockReturnValue([{ granted: true }, requestMicrophonePermission]);
    (usePermissions as jest.Mock).mockReturnValue([{ granted: true }, requestMediaLibraryPermission]);

    renderHook(() => usePermissionsGranted());

    await act(async () => {});

    expect(Alert.alert).toHaveBeenCalledWith("Error", "Camera permission is required.");
  });

  it('should alert if microphone permission is not granted', async () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([{ granted: true }, jest.fn()]);
    (useMicrophonePermissions as jest.Mock).mockReturnValue([{ granted: false }, jest.fn()]);
    (usePermissions as jest.Mock).mockReturnValue([{ granted: true }, jest.fn()]);

    const requestCameraPermission = jest.fn().mockResolvedValue({ granted: true });
    const requestMicrophonePermission = jest.fn().mockResolvedValue({ granted: false });
    const requestMediaLibraryPermission = jest.fn().mockResolvedValue({ granted: true });

    (useCameraPermissions as jest.Mock).mockReturnValue([{ granted: true }, requestCameraPermission]);
    (useMicrophonePermissions as jest.Mock).mockReturnValue([{ granted: false }, requestMicrophonePermission]);
    (usePermissions as jest.Mock).mockReturnValue([{ granted: true }, requestMediaLibraryPermission]);

    renderHook(() => usePermissionsGranted());

    await act(async () => {});

    expect(Alert.alert).toHaveBeenCalledWith("Error", "Microphone permission is required.");
  });

  it('should alert if media library permission is not granted', async () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([{ granted: true }, jest.fn()]);
    (useMicrophonePermissions as jest.Mock).mockReturnValue([{ granted: true }, jest.fn()]);
    (usePermissions as jest.Mock).mockReturnValue([{ granted: false }, jest.fn()]);

    const requestCameraPermission = jest.fn().mockResolvedValue({ granted: true });
    const requestMicrophonePermission = jest.fn().mockResolvedValue({ granted: true });
    const requestMediaLibraryPermission = jest.fn().mockResolvedValue({ granted: false });

    (useCameraPermissions as jest.Mock).mockReturnValue([{ granted: true }, requestCameraPermission]);
    (useMicrophonePermissions as jest.Mock).mockReturnValue([{ granted: true }, requestMicrophonePermission]);
    (usePermissions as jest.Mock).mockReturnValue([{ granted: false }, requestMediaLibraryPermission]);

    renderHook(() => usePermissionsGranted());

    await act(async () => {});

    expect(Alert.alert).toHaveBeenCalledWith("Error", "Media Library permission is required.");
  });
});
