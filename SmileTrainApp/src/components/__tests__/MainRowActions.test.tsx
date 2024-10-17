import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import MainRowActions from "../MainRowActions";
import { View } from "react-native";

jest.mock("expo-symbols", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    SymbolView: ({
      name,
      size,
      tintColor,
      style,
      animationSpec,
    }: {
      name: string;
      size: number;
      tintColor: string;
      style: object;
      animationSpec: { effect: { type: string } };
    }) => (
      <View
        testID="main-row-actions-icon"
        style={style}
        name={name}
        tintColor={tintColor}
        animationSpec={animationSpec}
      />
    ),
  };
});

describe("MainRowActions Component", () => {
  const mockHandleTakePicture = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with recording state", () => {
    const { getByTestId } = render(
      <MainRowActions
        handleTakePicture={mockHandleTakePicture}
        disabled={false}
        isRecording={true}
      />
    );

    const icon = getByTestId("main-row-actions-icon");
    expect(icon.props.name).toBe("record.circle");
    expect(icon.props.tintColor).toBe("#FFFC00");
    expect(icon.props.animationSpec.effect.type).toBe("pulse");
  });

  it("renders correctly when not recording", () => {
    const { getByTestId } = render(
      <MainRowActions
        handleTakePicture={mockHandleTakePicture}
        disabled={false}
        isRecording={false}
      />
    );

    const icon = getByTestId("main-row-actions-icon");
    expect(icon.props.name).toBe("circle.circle");
    expect(icon.props.tintColor).toBe("white");
    expect(icon.props.animationSpec.effect.type).toBe("bounce");
  });

  it("calls handleTakePicture when button is pressed", () => {
    const { getByTestId } = render(
      <MainRowActions
        handleTakePicture={mockHandleTakePicture}
        disabled={false}
        isRecording={false}
      />
    );

    const button = getByTestId("main-row-actions-icon").parent;
    fireEvent.press(button);

    expect(mockHandleTakePicture).toHaveBeenCalledTimes(1);
  });

  it("sets opacity to 0.5 when disabled", () => {
    const { getByTestId } = render(
      <MainRowActions
        handleTakePicture={mockHandleTakePicture}
        disabled={true}
        isRecording={false}
      />
    );

    const icon = getByTestId("main-row-actions-icon");
    expect(icon.props.style.opacity).toBe(0.5);
  });

  it("sets opacity to 1 when not disabled", () => {
    const { getByTestId } = render(
      <MainRowActions
        handleTakePicture={mockHandleTakePicture}
        disabled={false}
        isRecording={false}
      />
    );

    const icon = getByTestId("main-row-actions-icon");
    expect(icon.props.style.opacity).toBe(1);
  });
});
