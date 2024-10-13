import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CameraTools from "../CameraTools";

jest.mock("@expo/vector-icons/Ionicons", () => "Icon");

jest.mock("expo-symbols", () => ({
  SFSymbol: jest.fn(),
  SymbolView: jest.fn(),
}));

describe("CameraTools", () => {
  let setCameraFacingMock: jest.Mock;
  let setCameraFlashMock: jest.Mock;

  beforeEach(() => {
    setCameraFacingMock = jest.fn();
    setCameraFlashMock = jest.fn();
  });

  it("renders correctly", () => {
    const { getAllByRole } = render(
      <CameraTools
        cameraFlash={false}
        setCameraFacing={setCameraFacingMock}
        setCameraFlash={setCameraFlashMock}
      />
    );

    const buttons = getAllByRole("button");
    expect(buttons.length).toBe(2);
  });

  it("toggles camera facing direction", () => {
    const { getAllByRole } = render(
      <CameraTools
        cameraFlash={false}
        setCameraFacing={setCameraFacingMock}
        setCameraFlash={setCameraFlashMock}
      />
    );

    const buttons = getAllByRole("button");

    fireEvent.press(buttons[0]);
    expect(setCameraFacingMock).toHaveBeenCalledWith(expect.any(Function));

    const updateFunction = setCameraFacingMock.mock.calls[0][0];
    updateFunction("back");

    expect(setCameraFacingMock).toHaveBeenCalledWith(expect.any(Function));

    const updateFunction2 = setCameraFacingMock.mock.calls[1][0];
    updateFunction2("front");
    expect(setCameraFacingMock).toHaveBeenCalledTimes(2);
  });

  it("toggles camera flash state", () => {
    const { getAllByRole } = render(
      <CameraTools
        cameraFlash={false}
        setCameraFacing={setCameraFacingMock}
        setCameraFlash={setCameraFlashMock}
      />
    );

    const buttons = getAllByRole("button");

    fireEvent.press(buttons[1]);
    expect(setCameraFlashMock).toHaveBeenCalledWith(expect.any(Function));

    const flashUpdateFunction = setCameraFlashMock.mock.calls[0][0];
    flashUpdateFunction(false);

    expect(setCameraFlashMock).toHaveBeenCalledWith(expect.any(Function));

    const flashUpdateFunction2 = setCameraFlashMock.mock.calls[1][0];
    flashUpdateFunction2(true);
    expect(setCameraFlashMock).toHaveBeenCalledTimes(2);
  });
});
