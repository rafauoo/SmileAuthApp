import { renderHook, act, waitFor } from "@testing-library/react";
import usePermissionsGranted from "../usePermissionsGranted";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Camera from "expo-camera";
import * as MediaLibrary from "expo-media-library";

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
}));

jest.mock("expo-camera", () => ({
  useCameraPermissions: jest
    .fn()
    .mockReturnValue([
      { granted: true },
      jest.fn().mockResolvedValue({ granted: true }),
    ]),
  useMicrophonePermissions: jest
    .fn()
    .mockReturnValue([
      { granted: true },
      jest.fn().mockResolvedValue({ granted: true }),
    ]),
}));

jest.mock("expo-media-library", () => ({
  usePermissions: jest
    .fn()
    .mockReturnValue([
      { granted: true },
      jest.fn().mockResolvedValue({ granted: true }),
    ]),
}));

describe("usePermissionsGranted", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return false if camera permission is denied", async () => {
    (Camera.useCameraPermissions as jest.Mock).mockReturnValue([
      { granted: false },
      jest.fn().mockResolvedValue({ granted: false }),
    ]);

    (Camera.useMicrophonePermissions as jest.Mock).mockReturnValue([
      { granted: true },
      jest.fn().mockResolvedValue({ granted: true }),
    ]);

    (MediaLibrary.usePermissions as jest.Mock).mockReturnValue([
      { granted: true },
      jest.fn().mockResolvedValue({ granted: true }),
    ]);

    const alertSpy = jest.spyOn(Alert, "alert");
    const { result } = renderHook(() => usePermissionsGranted());
    await waitFor(() => {
      expect(result.current).toBe(false);
      expect(alertSpy).toHaveBeenCalledWith(
        "Error",
        "Camera permission is required."
      );
    });
  });

  it("should return false if microphone permission is denied", async () => {
    (Camera.useCameraPermissions as jest.Mock).mockReturnValue([
      { granted: true },
      jest.fn().mockResolvedValue({ granted: true }),
    ]);

    (Camera.useMicrophonePermissions as jest.Mock).mockReturnValue([
      { granted: false },
      jest.fn().mockResolvedValue({ granted: false }),
    ]);

    (MediaLibrary.usePermissions as jest.Mock).mockReturnValue([
      { granted: true },
      jest.fn().mockResolvedValue({ granted: true }),
    ]);

    const alertSpy = jest.spyOn(Alert, "alert");
    const { result } = renderHook(() => usePermissionsGranted());

    await waitFor(() => {
      expect(result.current).toBe(false);
      expect(alertSpy).toHaveBeenCalledWith(
        "Error",
        "Microphone permission is required."
      );
    });
  });

  it("should return false if media library permission is denied", async () => {
    (Camera.useCameraPermissions as jest.Mock).mockReturnValue([
      { granted: true },
      jest.fn().mockResolvedValue({ granted: true }),
    ]);

    (Camera.useMicrophonePermissions as jest.Mock).mockReturnValue([
      { granted: true },
      jest.fn().mockResolvedValue({ granted: true }),
    ]);

    (MediaLibrary.usePermissions as jest.Mock).mockReturnValue([
      { granted: false },
      jest.fn().mockResolvedValue({ granted: false }),
    ]);

    const alertSpy = jest.spyOn(Alert, "alert");
    const { result } = renderHook(() => usePermissionsGranted());

    await waitFor(() => {
      expect(result.current).toBe(false);
      expect(alertSpy).toHaveBeenCalledWith(
        "Error",
        "Media Library permission is required."
      );
    });
  });

  it("should return true if all permissions are granted", async () => {
    (Camera.useCameraPermissions as jest.Mock).mockReturnValue([
      { granted: true },
      jest.fn().mockResolvedValue({ granted: true }),
    ]);

    (Camera.useMicrophonePermissions as jest.Mock).mockReturnValue([
      { granted: true },
      jest.fn().mockResolvedValue({ granted: true }),
    ]);

    (MediaLibrary.usePermissions as jest.Mock).mockReturnValue([
      { granted: true },
      jest.fn().mockResolvedValue({ granted: true }),
    ]);

    const { result } = renderHook(() => usePermissionsGranted());
    await waitFor(() => {
      expect(result.current).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("hasOpened", "true");
    });
  });
});
