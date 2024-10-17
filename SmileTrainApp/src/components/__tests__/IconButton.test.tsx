import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import IconButton from "../../components/IconButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SFSymbol } from "expo-symbols";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("expo-symbols", () => ({
  SymbolView: jest.fn(({ fallback }) => fallback),
}));

describe("IconButton", () => {
  const mockOnPress = jest.fn();

  const defaultProps = {
    iosName: "some-ios-icon" as SFSymbol,
    androidName: "checkmark" as const,
    containerPadding: 10,
    containerWidth: 50,
    iconSize: 24,
    color: "white",
    testID: "icon-button",
  };

  it("renders correctly with provided props", () => {
    const { getByTestId } = render(<IconButton {...defaultProps} />);

    const button = getByTestId("icon-button");
    expect(button).toBeTruthy();
  });

  it("displays the correct background color", () => {
    const { getByTestId } = render(
      <IconButton {...defaultProps} bgColor="red" />
    );

    const button = getByTestId("icon-button");
    expect(button.props.style).toEqual({
      backgroundColor: "red",
      borderRadius: 35,
      height: 50,
      opacity: 1,
      padding: 10,
      width: 50,
    });
  });

  it("calls onPress when pressed", () => {
    const { getByTestId } = render(
      <IconButton {...defaultProps} onPress={mockOnPress} />
    );

    const button = getByTestId("icon-button");
    fireEvent.press(button);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it("applies custom container styles", () => {
    const { getByTestId } = render(
      <IconButton
        {...defaultProps}
        containerStyle={{ borderColor: "blue", borderWidth: 2 }}
      />
    );

    const button = getByTestId("icon-button");
    expect(button.props.style).toEqual({
      backgroundColor: "#00000050",
      borderColor: "blue",
      borderRadius: 35,
      borderWidth: 2,
      height: 50,
      opacity: 1,
      padding: 10,
      width: 50,
    });
  });

  it("defaults background color to transparent black when bgColor is not provided", () => {
    const { getByTestId } = render(
      <IconButton {...defaultProps} bgColor={undefined} />
    );

    const button = getByTestId("icon-button");
    expect(button.props.style).toEqual({
      backgroundColor: "#00000050",
      borderRadius: 35,
      height: 50,
      opacity: 1,
      padding: 10,
      width: 50,
    });
  });
});
