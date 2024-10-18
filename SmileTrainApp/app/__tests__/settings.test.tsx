import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import Settings from "../settings";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import "react-native-gesture-handler/jestSetup";

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
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: jest.fn(),
}));

jest.mock("expo-symbols", () => ({
  SFSymbol: jest.fn(),
  SymbolView: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
}));

describe("Settings Screen", () => {
  const mockRouterPush = jest.fn();
  const mockChangeLanguage = jest.fn();
  const mockTranslation = {
    t: (key: string) => key,
    i18n: {
      changeLanguage: mockChangeLanguage,
      language: "en",
    },
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
    (useTranslation as jest.Mock).mockReturnValue(mockTranslation);
    jest.clearAllMocks();
  });

  it("should render the settings screen title", () => {
    const { getByText } = render(<Settings />);
    expect(getByText("screens.settings.title")).toBeTruthy();
  });

  it("should toggle dropdown visibility when dropdown button is pressed", async () => {
    const { getByText, queryByText } = render(<Settings />);
    const dropdownButton = getByText("English");
    expect(queryByText("Polski")).toBeNull();
    fireEvent.press(dropdownButton);
    await waitFor(() => expect(getByText("Polski")).toBeTruthy());
    fireEvent.press(dropdownButton);
    await waitFor(() => expect(queryByText("Polski")).toBeNull());
  });

  it("should change language when a language option is selected", async () => {
    const { getByText } = render(<Settings />);
    const dropdownButton = getByText("English");
    fireEvent.press(dropdownButton);
    const polishOption = getByText("Polski");
    fireEvent.press(polishOption);
    await waitFor(() => expect(mockChangeLanguage).toHaveBeenCalledWith("pl"));
  });

  it("should navigate to main screen on swipe right", async () => {
    const { getByTestId } = render(<Settings />);
    const gestureHandler = getByTestId("PanGestureHandler");
    fireEvent(gestureHandler, "onGestureEvent", {
      nativeEvent: { translationX: 150 },
    });
    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledWith("/main"));
  });

  it("should not navigate if swipe is not far enough", async () => {
    const { getByTestId } = render(<Settings />);
    const gestureHandler = getByTestId("PanGestureHandler");
    fireEvent(gestureHandler, "onGestureEvent", {
      nativeEvent: { translationX: 50 },
    });
    await waitFor(() => expect(mockRouterPush).not.toHaveBeenCalled());
  });
  it("should change language to English when English option is selected", async () => {
    const { getByText, getByTestId } = render(<Settings />);
    const dropdownButton = getByText("English");
    fireEvent.press(dropdownButton);
    const englishOptions = getByTestId("change-english");
    fireEvent.press(englishOptions);
    await waitFor(() => expect(mockChangeLanguage).toHaveBeenCalledWith("en"));
  });
});
