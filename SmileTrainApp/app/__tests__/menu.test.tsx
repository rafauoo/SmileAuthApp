import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import MenuScreen from "../menu";
import { useFocusEffect, useRouter } from "expo-router";
import { fetchHistory } from "@/src/hooks/fetchHistory";
import { useTranslation } from "react-i18next";
import { deleteEvaluation } from "@/src/hooks/deleteEvaluation";
import { Alert } from "react-native";
import "react-native-gesture-handler/jestSetup";

jest.mock("@expo/vector-icons/Ionicons", () => "Icon");

jest.mock("expo-symbols", () => ({
  SFSymbol: jest.fn(),
  SymbolView: jest.fn(),
}));

jest.mock("react-native-gesture-handler", () => {
  const { View } = require("react-native");

  return {
    PanGestureHandler: View,
    GestureHandlerRootView: View,
    State: {},
    TouchableOpacity: View,
    TapGestureHandler: View,
  };
});

jest.mock("@/src/hooks/fetchHistory");
jest.mock("@/src/hooks/deleteEvaluation");
jest.spyOn(Alert, "alert");

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  useFocusEffect: jest.fn(),
}));

const mockHistory = [
  {
    score: 85,
    comment: { pl: "Dobry wynik", en: "Good score" },
    date: "2024-10-17T10:00:00Z",
    video: "video-url-1",
  },
  {
    score: 92,
    comment: { pl: "Świetny wynik", en: "Great score" },
    date: "2024-10-18T11:00:00Z",
    video: "video-url-2",
  },
];

jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
}));

describe("MenuScreen", () => {
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key,
      i18n: {
        language: "en",
        changeLanguage: jest.fn(),
      },
    });
    (fetchHistory as jest.Mock).mockResolvedValue({
      success: true,
      evaluations: mockHistory,
    });
  });

  it("renders components correctly", async () => {
    const { unmount, getByText } = render(<MenuScreen />);

    await waitFor(() => {
      expect(getByText("screens.menu.chart.title")).toBeTruthy();
      expect(getByText("screens.menu.list.title")).toBeTruthy();
    });
    await unmount();
  });

  it("does not load history on mount when fetch fails", async () => {
    (fetchHistory as jest.Mock).mockResolvedValue({
      success: false,
      evaluations: null,
    });

    const { queryByText } = render(<MenuScreen />);

    await waitFor(() => {
      expect(queryByText("Good score")).toBeNull();
    });
  });

  it("navigates on swipe right", async () => {
    const { unmount, getByTestId } = render(<MenuScreen />);

    const gestureHandler = getByTestId("gesture-handler");
    fireEvent(gestureHandler, "onGestureEvent", {
      nativeEvent: {
        translationX: -120,
      },
    });

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/main");
    });
    await unmount();
  });

  it("should not navigate on gentle swipe right", async () => {
    const { unmount, getByTestId } = render(<MenuScreen />);

    const gestureHandler = getByTestId("gesture-handler");
    fireEvent(gestureHandler, "onGestureEvent", {
      nativeEvent: {
        translationX: -20,
      },
    });

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalled();
    });
    await unmount();
  });

  it("should not navigate on gentle swipe right", async () => {
    const { unmount, getByTestId } = render(<MenuScreen />);

    const gestureHandler = getByTestId("gesture-handler");
    fireEvent(gestureHandler, "onGestureEvent", {
      nativeEvent: {
        translationX: -20,
      },
    });

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalled();
    });
    await unmount();
  });

  it("shows delete evaluation alert", async () => {
    (deleteEvaluation as jest.Mock).mockResolvedValue({
      success: true,
      updatedHistory: [],
    });

    const alertSpy = jest.spyOn(Alert, "alert");
    const { unmount, getByTestId } = render(<MenuScreen />);

    await waitFor(() => {
      expect(getByTestId("trash-2024-10-17T10:00:00Z")).toBeTruthy();
    });
    fireEvent.press(getByTestId("trash-2024-10-17T10:00:00Z"));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "screens.menu.deleteAlert.title",
        "screens.menu.deleteAlert.desc",
        expect.any(Array)
      );
    });

    await unmount();
  });

  it("should update history normally", async () => {
    (deleteEvaluation as jest.Mock).mockResolvedValue({
      success: true,
      updatedHistory: mockHistory,
    });

    const { unmount, getByTestId, getByText } = render(<MenuScreen />);
    const alertSpy = jest.spyOn(Alert, "alert");
    await waitFor(() => {
      expect(getByTestId("trash-2024-10-17T10:00:00Z")).toBeTruthy();
    });
    fireEvent.press(getByTestId("trash-2024-10-17T10:00:00Z"));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
    });

    const alertCall = alertSpy.mock.calls[0];
    expect(alertCall).toBeDefined();
    const buttons = alertCall[2];
    expect(buttons).toBeDefined();
    if (buttons) {
      if (buttons[1] && typeof buttons[1].onPress === "function")
        buttons[1].onPress();
    }
    await waitFor(() => {
      expect(getByText("85.00%")).toBeTruthy();
      expect(getByText("92.00%")).toBeTruthy();
      expect(getByText("17/10/2024, 12:00:00")).toBeTruthy();
      expect(getByText("18/10/2024, 13:00:00")).toBeTruthy();
    });

    await unmount();
  });

  it("should show alert when unable to delete evaluation", async () => {
    (deleteEvaluation as jest.Mock).mockResolvedValue({
      success: false,
      updatedHistory: mockHistory,
    });

    const alertSpy = jest.spyOn(Alert, "alert");
    const { unmount, getByTestId, getByText } = render(<MenuScreen />);

    await waitFor(() => {
      expect(getByTestId("trash-2024-10-17T10:00:00Z")).toBeTruthy();
    });
    fireEvent.press(getByTestId("trash-2024-10-17T10:00:00Z"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
    });

    const alertCall = alertSpy.mock.calls[0];
    expect(alertCall).toBeDefined();
    const buttons = alertCall[2];
    expect(buttons).toBeDefined();
    if (buttons) {
      if (buttons[1] && typeof buttons[1].onPress === "function")
        buttons[1].onPress();
    }

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "exceptions.title",
        "exceptions.deleteEvaluation",
        expect.any(Array)
      );
    });

    await unmount();
  });
});
