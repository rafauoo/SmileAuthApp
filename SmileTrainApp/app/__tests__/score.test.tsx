import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Video } from "expo-av";
import ScoreScreen from "../score";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
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

const mockPlayAsync = jest.fn();
type VideoProps = {
  ref?: React.Ref<any>;
  source: { uri: string };
  style: object;
  isLooping: boolean;
  isMuted: boolean;
  resizeMode: "cover" | "contain" | "stretch";
};
jest.mock("expo-av", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    Video: React.forwardRef((props: VideoProps, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        playAsync: mockPlayAsync,
      }));
      return (
        <View
          testID="mock-video"
          ref={ref}
          style={props.style}
          source={props.source}
          isLooping={props.isLooping}
          isMuted={props.isMuted}
          resizeMode={props.resizeMode}
        />
      );
    }),
    ResizeMode: {
      COVER: "cover",
      CONTAIN: "contain",
      STRETCH: "stretch",
    },
  };
});

jest.mock("@expo/vector-icons/Ionicons", () => "Icon");

jest.mock("expo-symbols", () => ({
  SFSymbol: jest.fn(),
  SymbolView: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
}));

describe("ScoreScreen", () => {
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
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
    (useTranslation as jest.Mock).mockReturnValue(mockTranslation);
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      score: "85",
      comment: "Great job!",
      date: "2024-10-18T12:00:00Z",
      video: "video.mp4",
    });
  });

  it("should render correctly", async () => {
    const { unmount, getByText } = render(<ScoreScreen />);
    await waitFor(() => {
      expect(getByText("Great job!")).toBeTruthy();
      expect(getByText("85.00%")).toBeTruthy();
      expect(getByText("18/10/2024, 14:00:00")).toBeTruthy();
    });

    await unmount();
  });

  it("should call video playAsync on mount", async () => {
    const { unmount } = render(<ScoreScreen />);

    await waitFor(() => {
      expect(mockPlayAsync).toHaveBeenCalled();
    });
    await unmount();
  });

  it("should navigate to menu on swipe right", async () => {
    const { unmount, getByTestId } = render(<ScoreScreen />);
    const gestureHandler = getByTestId("PanGestureHandler");
    fireEvent(gestureHandler, "onGestureEvent", {
      nativeEvent: { translationX: 150 },
    });
    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledWith("/menu"));
    await unmount();
  });

  it("should not navigate to menu on gentle swipe right", async () => {
    const { unmount, getByTestId } = render(<ScoreScreen />);
    const gestureHandler = getByTestId("PanGestureHandler");
    fireEvent(gestureHandler, "onGestureEvent", {
      nativeEvent: { translationX: 50 },
    });
    await waitFor(() => expect(mockRouterPush).not.toHaveBeenCalled());
    await unmount();
  });

  it("should not show video without video file", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      score: "85",
      comment: "Great job!",
      date: "2024-10-18T12:00:00Z",
    });
    const { unmount, getByText } = render(<ScoreScreen />);
    await waitFor(() => {
      expect(getByText("screens.score.videoNotAv")).toBeTruthy();
    });
    await unmount();
  });
  it("should not show date without date", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      score: "85",
      comment: "Great job!",
      video: "video.mp4",
    });
    const { unmount, getByText } = render(<ScoreScreen />);
    await waitFor(() => {
      expect(getByText("screens.score.noDateAvailable")).toBeTruthy();
    });
    await unmount();
  });
});
