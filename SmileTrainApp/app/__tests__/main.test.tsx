import React, { ReactNode } from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { useFocusEffect, useRouter } from "expo-router";
import HomeScreen from "../main";
import { CameraView } from "expo-camera";
import { State } from "react-native-gesture-handler";
import { Alert } from "react-native";
import "react-native-gesture-handler/jestSetup";
const mockPlayAsync = jest.fn();
type VideoProps = {
  ref?: React.Ref<any>;
  source: { uri: string };
  style: object;
  isLooping: boolean;
  isMuted: boolean;
  resizeMode: "cover" | "contain" | "stretch";
};

type CameraViewProps = {
  ref?: React.Ref<any>;
  style: object;
  facing: "front" | "back";
  videoQuality: string;
  mode: "string";
  zoom: number;
  enableTorch: boolean;
  children?: ReactNode;
  onCameraReady: () => {};
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
const mockRecordAsync = jest.fn();
const mockStopRecording = jest.fn();
jest.mock("expo-camera", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    CameraView: React.forwardRef((props: CameraViewProps, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        recordAsync: mockRecordAsync,
        stopRecording: mockStopRecording,
      }));
      return (
        <View
          testID="camera-view"
          ref={ref}
          style={props.style}
          facing={props.facing}
          videoQuality={props.videoQuality}
          mode={props.mode}
          zoom={props.zoom}
          enableTorch={props.enableTorch}
          onCameraReady={props.onCameraReady}
        >
          {props.children}
        </View>
      );
    }),
  };
});
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

jest.spyOn(Alert, "alert");

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  useFocusEffect: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
}));
describe("HomeScreen", () => {
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
  });

  it("renders camera view", async () => {
    const { getByTestId } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByTestId("camera-view")).toBeTruthy();
    });
  });

  it("toggles camera facing on double tap", async () => {
    const { getByTestId } = render(<HomeScreen />);

    const tapGestureHandler = getByTestId("tap-gesture-handler");
    fireEvent(tapGestureHandler, "onHandlerStateChange", {
      nativeEvent: { state: State.ACTIVE },
    });

    expect(getByTestId("camera-view")).toHaveProp("facing", "front");
  });

  it("navigates to menu on swipe right", async () => {
    const { getByTestId } = render(<HomeScreen />);

    const panGestureHandler = getByTestId("pan-gesture-handler");
    fireEvent(panGestureHandler, "onGestureEvent", {
      nativeEvent: { translationX: 150 },
    });

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/menu");
    });
  });

  it("navigates to settings on swipe left", async () => {
    const { getByTestId } = render(<HomeScreen />);

    const panGestureHandler = getByTestId("pan-gesture-handler");
    fireEvent(panGestureHandler, "onGestureEvent", {
      nativeEvent: { translationX: -150 },
    });

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/settings");
    });
  });

  it("starts recording video", async () => {
    const { getByTestId } = render(<HomeScreen />);
    const cameraView = getByTestId("camera-view");
    fireEvent(cameraView, "onCameraReady");
    const mainRowActions = getByTestId("main-row-actions");
    fireEvent.press(mainRowActions);

    await waitFor(() => {
      expect(mockRecordAsync).toHaveBeenCalled();
    });
  });

  it("stops recording video", async () => {
    const { getByTestId } = render(<HomeScreen />);
    const cameraView = getByTestId("camera-view");
    fireEvent(cameraView, "onCameraReady");
    const tapGestureHandler = getByTestId("tap-gesture-handler");
    fireEvent(tapGestureHandler, "onHandlerStateChange", {
      nativeEvent: { state: State.ACTIVE },
    });
    fireEvent.press(getByTestId("main-row-actions"));
    fireEvent.press(getByTestId("main-row-actions"));

    await waitFor(() => {
      expect(mockStopRecording).toHaveBeenCalled();
    });
  });

  it("start recording video with front camera", async () => {
    const { getByTestId } = render(<HomeScreen />);
    const cameraView = getByTestId("camera-view");
    fireEvent(cameraView, "onCameraReady");
    fireEvent.press(getByTestId("main-row-actions"));
    fireEvent.press(getByTestId("main-row-actions"));

    await waitFor(() => {
      expect(mockStopRecording).toHaveBeenCalled();
    });
  });
});
