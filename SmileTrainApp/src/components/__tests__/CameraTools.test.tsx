import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CameraTools from "../CameraTools";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@expo/vector-icons/Ionicons", () => "Icon");

jest.mock("expo-symbols", () => ({
  SFSymbol: jest.fn(),
  SymbolView: jest.fn(),
}));

describe("CameraTools Component", () => {
  let setCameraFacing: jest.Mock;
  let setCameraFlash: jest.Mock;

  beforeEach(() => {
    setCameraFacing = jest.fn();
    setCameraFlash = jest.fn((prevValue) => prevValue);
  });

  it("should render correctly", () => {
    const { getByTestId } = render(
      <CameraTools
        cameraFlash={false}
        setCameraFacing={setCameraFacing}
        setCameraFlash={setCameraFlash}
      />
    );

    expect(getByTestId("iconButton-toggle-camera")).toBeTruthy();
    expect(getByTestId("iconButton-toggle-flash")).toBeTruthy();
  });

  it("should toggle camera facing when the button is pressed", () => {
    const { getByTestId } = render(
      <CameraTools
        cameraFlash={false}
        setCameraFacing={setCameraFacing}
        setCameraFlash={setCameraFlash}
      />
    );

    const toggleCameraButton = getByTestId("iconButton-toggle-camera");

    fireEvent.press(toggleCameraButton);

    expect(setCameraFacing).toHaveBeenCalledTimes(1);
    const facingFunction = setCameraFacing.mock.calls[0][0];

    const newStateAfterFirstPress = facingFunction("back");
    expect(newStateAfterFirstPress).toBe("front");

    setCameraFacing.mockClear();

    fireEvent.press(toggleCameraButton);

    expect(setCameraFacing).toHaveBeenCalledTimes(1);
    const facingFunctionSecondCall = setCameraFacing.mock.calls[0][0];

    const newStateAfterSecondPress = facingFunctionSecondCall("front");
    expect(newStateAfterSecondPress).toBe("back");
  });

  it("should toggle camera flash when the button is pressed", () => {
    const { getByTestId } = render(
      <CameraTools
        cameraFlash={false}
        setCameraFacing={setCameraFacing}
        setCameraFlash={setCameraFlash}
      />
    );

    const toggleFlashButton = getByTestId("iconButton-toggle-flash");
    fireEvent.press(toggleFlashButton);

    expect(setCameraFlash).toHaveBeenCalledTimes(1);
  });

  it("should toggle camera flash state correctly", () => {
    const { getByTestId, rerender } = render(
      <CameraTools
        cameraFlash={false}
        setCameraFacing={setCameraFacing}
        setCameraFlash={setCameraFlash}
      />
    );

    fireEvent.press(getByTestId("iconButton-toggle-flash"));

    expect(setCameraFlash).toHaveBeenCalledTimes(1);
    expect(setCameraFlash).toHaveBeenCalledWith(expect.any(Function));

    const flashCallback = setCameraFlash.mock.calls[0][0];
    flashCallback(false);

    rerender(
      <CameraTools
        cameraFlash={true}
        setCameraFacing={setCameraFacing}
        setCameraFlash={setCameraFlash}
      />
    );

    fireEvent.press(getByTestId("iconButton-toggle-flash"));

    const flashCallbackOff = setCameraFlash.mock.calls[1][0];
    flashCallbackOff(true);
    expect(setCameraFlash).toHaveBeenCalledWith(expect.any(Function));
  });
});
