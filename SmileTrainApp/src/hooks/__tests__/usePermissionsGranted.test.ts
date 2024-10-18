import { renderHook, act, waitFor } from "@testing-library/react";
import usePermissionsGranted from "../usePermissionsGranted"; // Upewnij się, że ścieżka jest poprawna
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Camera from "expo-camera";
import * as MediaLibrary from "expo-media-library";

// Mockowanie AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
}));

// Mockowanie useCameraPermissions, useMicrophonePermissions i usePermissions
jest.mock("expo-camera", () => ({
  useCameraPermissions: jest.fn().mockReturnValue([
    { granted: true }, // Bieżący stan uprawnień
    jest.fn().mockResolvedValue({ granted: true }), // Funkcja request zwracająca resolved promise
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
    jest.clearAllMocks(); // Resetuje mocki przed każdym testem
  });

  it("should return false if camera permission is denied", async () => {
    (Camera.useCameraPermissions as jest.Mock).mockReturnValue([
      { granted: false },
      jest.fn().mockResolvedValue({ granted: false }), // Symulacja odmowy uprawnień
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
      jest.fn().mockResolvedValue({ granted: true }), // Symulacja odmowy uprawnień
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
      jest.fn().mockResolvedValue({ granted: true }), // Symulacja odmowy uprawnień
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
      jest.fn().mockResolvedValue({ granted: true }), // Symulacja odmowy uprawnień
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
