import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import BottomRowTools from "../BottomRowTools";
import { useRouter } from "expo-router";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@expo/vector-icons/Ionicons", () => "Icon");

jest.mock("expo-symbols", () => ({
  SFSymbol: jest.fn(),
  SymbolView: jest.fn(),
}));

describe("BottomRowTools", () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("should render correctly", () => {
    const { getByTestId } = render(<BottomRowTools />);
    expect(getByTestId("menu-button")).toBeTruthy();
    expect(getByTestId("settings-button")).toBeTruthy();
  });

  it("should call router.push with /menu when the menu button is pressed", () => {
    const { getByTestId } = render(<BottomRowTools />);
    const menuButton = getByTestId("menu-button");

    fireEvent.press(menuButton);
    expect(mockPush).toHaveBeenCalledWith("/menu");
  });

  it("should call router.push with /settings when the settings button is pressed", () => {
    const { getByTestId } = render(<BottomRowTools />);
    const settingsButton = getByTestId("settings-button");

    fireEvent.press(settingsButton);
    expect(mockPush).toHaveBeenCalledWith("/settings");
  });
});
