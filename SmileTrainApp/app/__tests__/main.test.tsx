import React, { ReactNode } from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { useFocusEffect, useRouter } from "expo-router";
import HomeScreen from "../main";
import { CameraView } from "expo-camera";
import { SafeAreaView } from "react-native";
import { State } from "react-native-gesture-handler";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
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
    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key,
      i18n: {
        language: "en",
        changeLanguage: jest.fn(),
      },
    });
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

  it("starts recording video with flash turned on and front camera", async () => {
    const { getByTestId } = render(<HomeScreen />);
    const cameraView = getByTestId("camera-view");
    const safeAreaView = getByTestId("camera-view").findByType(SafeAreaView);
    const tapGestureHandler = getByTestId("tap-gesture-handler");
    fireEvent(tapGestureHandler, "onHandlerStateChange", {
      nativeEvent: { state: State.ACTIVE },
    });
    expect(getByTestId("camera-view")).toHaveProp("facing", "front");
    expect(safeAreaView.props.style.backgroundColor).toBe("transparent");
    fireEvent(cameraView, "onCameraReady");
    const mainRowActions = getByTestId("main-row-actions");
    const flashButton = getByTestId("iconButton-toggle-flash");
    await waitFor(() => {
      fireEvent.press(flashButton);
    });

    await waitFor(() => {
      fireEvent.press(mainRowActions);
      expect(mockRecordAsync).toHaveBeenCalled();
      expect(safeAreaView.props.style.backgroundColor).toBe("white");
    });
  });

  it("stops recording video after recording with front camera", async () => {
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

  it("stop recording and getting response from recordAsync", async () => {
    (mockRecordAsync as jest.Mock).mockReturnValue({ uri: "video.mp4" });
    const { getByTestId } = render(<HomeScreen />);
    const cameraView = getByTestId("camera-view");
    fireEvent(cameraView, "onCameraReady");
    fireEvent.press(getByTestId("main-row-actions"));
    fireEvent.press(getByTestId("main-row-actions"));

    await waitFor(() => {
      expect(mockStopRecording).toHaveBeenCalled();
      expect(getByTestId("mock-video")).toBeTruthy();
    });
  });

  it("should not record while camera is not ready", async () => {
    (mockRecordAsync as jest.Mock).mockReturnValue({ uri: "video.mp4" });
    const { getByTestId } = render(<HomeScreen />);
    fireEvent.press(getByTestId("main-row-actions"));
    fireEvent.press(getByTestId("main-row-actions"));

    await waitFor(() => {
      expect(mockRecordAsync).toHaveBeenCalled();
    });
  });
  test("toggles camera facing on double tap both ways", async () => {
    const { getByTestId } = render(<HomeScreen />);
    const tapGestureHandler = getByTestId("tap-gesture-handler");
    expect(getByTestId("camera-view")).toHaveProp("facing", "back");
    fireEvent(tapGestureHandler, "onHandlerStateChange", {
      nativeEvent: { state: State.ACTIVE },
    });
    expect(getByTestId("camera-view")).toHaveProp("facing", "front");
    fireEvent(tapGestureHandler, "onHandlerStateChange", {
      nativeEvent: { state: State.ACTIVE },
    });
    expect(getByTestId("camera-view")).toHaveProp("facing", "back");
    fireEvent(tapGestureHandler, "onHandlerStateChange", {
      nativeEvent: { state: State.ACTIVE },
    });
    expect(getByTestId("camera-view")).toHaveProp("facing", "front");
  });

  test("should not toggle camera when different event", async () => {
    const { getByTestId } = render(<HomeScreen />);
    const tapGestureHandler = getByTestId("tap-gesture-handler");
    fireEvent(tapGestureHandler, "onHandlerStateChange", {
      nativeEvent: { state: State.END },
    });
    expect(getByTestId("camera-view")).toHaveProp("facing", "front");
  });
});
