import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import BottomRowScore from "../BottomRowScore";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { deleteEvaluation } from "../../hooks/deleteEvaluation";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@expo/vector-icons/Ionicons", () => "Icon");

jest.mock("expo-symbols", () => ({
  SFSymbol: jest.fn(),
  SymbolView: jest.fn(),
  NativeModule: jest.fn(() => ({})),
}));

jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
}));

jest.mock("../../hooks/deleteEvaluation", () => ({
  deleteEvaluation: jest.fn(),
}));

describe("BottomRowScore Component", () => {
  const mockPush = jest.fn();
  const mockDeleteEvaluation = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key,
    });

    (deleteEvaluation as jest.Mock).mockImplementation(mockDeleteEvaluation);
  });

  it("should navigate to the menu when the back button is pressed", () => {
    const { getByTestId } = render(<BottomRowScore date={"2024-10-10"} />);

    const backButton = getByTestId("iconButton-back");
    fireEvent.press(backButton);

    expect(mockPush).toHaveBeenCalledWith("/menu");
  });

  it("should display an alert when the delete button is pressed", () => {
    const alertSpy = jest.spyOn(Alert, "alert");

    const { getByTestId } = render(<BottomRowScore date="2024-10-10" />);

    const deleteButton = getByTestId("iconButton-delete");
    fireEvent.press(deleteButton);

    expect(alertSpy).toHaveBeenCalledWith(
      "screens.menu.deleteAlert.title",
      "screens.menu.deleteAlert.desc",
      expect.any(Array)
    );
  });

  it("should call deleteEvaluation and navigate when the delete alert ok is pressed", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");

    const { getByTestId } = render(<BottomRowScore date="2024-10-10" />);

    const deleteButton = getByTestId("iconButton-delete");
    fireEvent.press(deleteButton);

    const alertButtons = alertSpy.mock.calls[0][2];
    expect(alertButtons).toBeDefined();

    const okButton = alertButtons && alertButtons[1];
    expect(okButton).toBeDefined();

    if (okButton && okButton.onPress) {
      await okButton.onPress();
    }

    expect(mockDeleteEvaluation).toHaveBeenCalledWith("2024-10-10");
    expect(mockPush).toHaveBeenCalledWith("/menu");
  });

  it("should not call deleteEvaluation if date is undefined", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");

    const { getByTestId } = render(<BottomRowScore date={undefined} />);

    const deleteButton = getByTestId("iconButton-delete");
    fireEvent.press(deleteButton);

    expect(alertSpy).not.toHaveBeenCalled();
    expect(mockDeleteEvaluation).not.toHaveBeenCalled();
  });
});
