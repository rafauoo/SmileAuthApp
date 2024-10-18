import React, { createRef } from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import VideoViewComponent from "../VideoView";
import { sendVideoToServer } from "../../hooks/sendToServer";
import { saveEvaluation } from "../../hooks/saveEvaluation";
import { Video } from "expo-av";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
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
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@expo/vector-icons/Ionicons", () => "Icon");

jest.mock("expo-symbols", () => ({
  SFSymbol: jest.fn(),
  SymbolView: jest.fn(),
}));

jest.mock("../../hooks/sendToServer", () => ({
  sendVideoToServer: jest.fn(),
}));

jest.mock("../../hooks/saveEvaluation", () => ({
  saveEvaluation: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
}));

describe("VideoViewComponent", () => {
  const mockRouterPush = jest.fn();
  const mockSetVideo = jest.fn();

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the video and buttons correctly", () => {
    const { getByTestId } = render(
      <VideoViewComponent video="mock-video-url" setVideo={mockSetVideo} />
    );
    expect(getByTestId("mock-video")).toBeTruthy();

    expect(getByTestId("cancel-button")).toBeTruthy();
    expect(getByTestId("send-button")).toBeTruthy();
  });

  it("calls setVideo with an empty string when the cancel button is pressed", async () => {
    const { getByTestId } = render(
      <VideoViewComponent video="mock-video-url" setVideo={mockSetVideo} />
    );

    fireEvent.press(getByTestId("cancel-button"));
    await waitFor(() => {
      expect(mockSetVideo).toHaveBeenCalledWith("");
    });
  });

  it("shows loading indicator while the video is being sent", async () => {
    (sendVideoToServer as jest.Mock).mockResolvedValue({
      success: true,
      result: "5",
      comment: { en: "Test comment", pl: "Testowy komentarz" },
    });

    (saveEvaluation as jest.Mock).mockResolvedValue({
      success: true,
      date: "2024-10-17",
      videoSaveSuccess: true,
    });

    const { getByTestId, queryByText } = render(
      <VideoViewComponent video="mock-video-url" setVideo={mockSetVideo} />
    );

    fireEvent.press(getByTestId("send-button"));
    await waitFor(() => {
      expect(queryByText("components.videoView.evaluating")).toBeTruthy();
    });
  });

  it("shows alert if could not save evaluation", async () => {
    (sendVideoToServer as jest.Mock).mockResolvedValue({
      success: true,
      result: "5",
      comment: { en: "Test comment", pl: "Testowy komentarz" },
    });

    (saveEvaluation as jest.Mock).mockResolvedValue({
      success: false,
      date: "2024-10-17",
      videoSaveSuccess: true,
    });
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByTestId } = render(
      <VideoViewComponent video="mock-video-url" setVideo={mockSetVideo} />
    );

    fireEvent.press(getByTestId("send-button"));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "exceptions.title",
        "exceptions.saveEvaluationFail",
        expect.any(Array)
      );
    });
  });

  it("shows alert if date was not returned by save evaluation", async () => {
    (sendVideoToServer as jest.Mock).mockResolvedValue({
      success: true,
      result: "5",
      comment: { en: "Test comment", pl: "Testowy komentarz" },
    });

    (saveEvaluation as jest.Mock).mockResolvedValue({
      success: true,
      date: null,
      videoSaveSuccess: true,
    });
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByTestId } = render(
      <VideoViewComponent video="mock-video-url" setVideo={mockSetVideo} />
    );

    fireEvent.press(getByTestId("send-button"));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "exceptions.title",
        "exceptions.saveEvaluationFail",
        expect.any(Array)
      );
    });
  });

  it("shows alert if video was not saved", async () => {
    (sendVideoToServer as jest.Mock).mockResolvedValue({
      success: true,
      result: "5",
      comment: { en: "Test comment", pl: "Testowy komentarz" },
    });

    (saveEvaluation as jest.Mock).mockResolvedValue({
      success: true,
      date: "2024-10-17",
      videoSaveSuccess: false,
    });
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByTestId } = render(
      <VideoViewComponent video="mock-video-url" setVideo={mockSetVideo} />
    );

    fireEvent.press(getByTestId("send-button"));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "exceptions.title",
        "exceptions.saveEvaluationFailVideo",
        expect.any(Array)
      );
    });
  });

  it("sends video and navigates to the score screen on success", async () => {
    (sendVideoToServer as jest.Mock).mockResolvedValue({
      success: true,
      result: "5",
      comment: { en: "Test comment", pl: "Testowy komentarz" },
    });
    (saveEvaluation as jest.Mock).mockResolvedValue({
      success: true,
      date: "2024-10-17",
      videoSaveSuccess: true,
    });

    const { getByTestId } = render(
      <VideoViewComponent video="mock-video-url" setVideo={mockSetVideo} />
    );

    fireEvent.press(getByTestId("send-button"));

    await waitFor(() => {
      expect(sendVideoToServer).toHaveBeenCalledWith("mock-video-url");
      expect(saveEvaluation).toHaveBeenCalledWith(
        5,
        { en: "Test comment", pl: "Testowy komentarz" },
        "mock-video-url"
      );
      expect(mockRouterPush).toHaveBeenCalledWith({
        pathname: "/score",
        params: {
          score: "5",
          comment: "Test comment",
          date: "2024-10-17",
          video: "mock-video-url",
        },
      });
    });
  });

  it("shows an error alert when video sending fails", async () => {
    (sendVideoToServer as jest.Mock).mockResolvedValue({
      success: false,
      error: "serverError",
    });

    const alertSpy = jest.spyOn(Alert, "alert");

    const { getByTestId } = render(
      <VideoViewComponent video="mock-video-url" setVideo={mockSetVideo} />
    );

    fireEvent.press(getByTestId("send-button"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "exceptions.title",
        "exceptions.serverError",
        expect.any(Array)
      );
    });
  });

  it("shows alert if could not save evaluation without comment", async () => {
    (sendVideoToServer as jest.Mock).mockResolvedValue({
      success: true,
      result: "5",
      comment: null,
    });

    (saveEvaluation as jest.Mock).mockResolvedValue({
      success: false,
      date: "2024-10-17",
      videoSaveSuccess: true,
    });
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByTestId } = render(
      <VideoViewComponent video="mock-video-url" setVideo={mockSetVideo} />
    );

    fireEvent.press(getByTestId("send-button"));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "exceptions.title",
        "exceptions.saveEvaluationFail",
        expect.any(Array)
      );
    });
  });

  it("shows alert if date was not returned by save evaluation without comment", async () => {
    (sendVideoToServer as jest.Mock).mockResolvedValue({
      success: true,
      result: "5",
      comment: null,
    });

    (saveEvaluation as jest.Mock).mockResolvedValue({
      success: true,
      date: null,
      videoSaveSuccess: true,
    });
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByTestId } = render(
      <VideoViewComponent video="mock-video-url" setVideo={mockSetVideo} />
    );

    fireEvent.press(getByTestId("send-button"));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "exceptions.title",
        "exceptions.saveEvaluationFail",
        expect.any(Array)
      );
    });
  });

  it("shows alert if video was not saved without comment", async () => {
    (sendVideoToServer as jest.Mock).mockResolvedValue({
      success: true,
      result: "5",
      comment: null,
    });

    (saveEvaluation as jest.Mock).mockResolvedValue({
      success: true,
      date: "2024-10-17",
      videoSaveSuccess: false,
    });
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByTestId } = render(
      <VideoViewComponent video="mock-video-url" setVideo={mockSetVideo} />
    );

    fireEvent.press(getByTestId("send-button"));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "exceptions.title",
        "exceptions.saveEvaluationFailVideo",
        expect.any(Array)
      );
    });
  });

  it("shows alert if got not standard error", async () => {
    (sendVideoToServer as jest.Mock).mockResolvedValue({
      error: "non-standard-error",
      nonStandard: true,
    });

    (saveEvaluation as jest.Mock).mockResolvedValue({
      success: true,
      date: "2024-10-17",
      videoSaveSuccess: false,
    });
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByTestId } = render(
      <VideoViewComponent video="mock-video-url" setVideo={mockSetVideo} />
    );

    fireEvent.press(getByTestId("send-button"));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "exceptions.title",
        "non-standard-error",
        expect.any(Array)
      );
    });
  });

  it("should call playAsync when the component mounts", async () => {
    render(<VideoViewComponent video="video.mp4" setVideo={mockSetVideo} />);
    await waitFor(() => {
      expect(mockPlayAsync).toHaveBeenCalledTimes(1);
    });
  });
});
