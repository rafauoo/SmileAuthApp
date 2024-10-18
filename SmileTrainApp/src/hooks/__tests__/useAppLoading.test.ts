import { renderHook, act } from "@testing-library/react";
import useAppLoading from "../useAppLoading";
import * as Fonts from "@expo-google-fonts/roboto";

jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn(),
}));

jest.mock("@expo-google-fonts/roboto", () => ({
  useFonts: jest.fn(),
}));

describe("useAppLoading", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return false when fonts are not loaded", () => {
    (Fonts.useFonts as jest.Mock).mockReturnValue([false]);

    const { result } = renderHook(() => useAppLoading());

    expect(result.current).toBe(false);
  });

  it("should return true when fonts are loaded", async () => {
    (Fonts.useFonts as jest.Mock).mockReturnValue([true]);

    const { result } = renderHook(() => useAppLoading());

    expect(result.current).toBe(true);
  });
});
