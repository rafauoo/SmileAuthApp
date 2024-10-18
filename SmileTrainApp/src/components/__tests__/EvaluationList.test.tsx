import React from "react";
import { render, fireEvent, act, waitFor } from "@testing-library/react-native";
import EvaluationList from "../../components/EvaluationList";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));
jest.mock("@expo/vector-icons/Ionicons", () => "Icon");

jest.mock("expo-symbols", () => ({
  SFSymbol: jest.fn(),
  SymbolView: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
}));

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

const mockHistory = [
  {
    score: 85,
    comment: { pl: "Dobry wynik", en: "Good score" },
    date: "2024-10-17T10:00:00Z",
    video: "video-url-1",
  },
  {
    score: 92,
    comment: { pl: "Świetny wynik", en: "Great score" },
    date: "2024-10-18T11:00:00Z",
    video: "video-url-2",
  },
];

const mockOnDelete = jest.fn();

describe("EvaluationList", () => {
  it("renders the evaluation list", async () => {
    const { unmount, getByText } = render(
      <EvaluationList history={mockHistory} onDelete={mockOnDelete} />
    );

    expect(getByText("85.00%")).toBeTruthy();
    expect(getByText("92.00%")).toBeTruthy();

    expect(getByText("17/10/2024, 12:00:00")).toBeTruthy();
    expect(getByText("18/10/2024, 13:00:00")).toBeTruthy();
    await unmount();
  });

  it("navigates to score screen when an item is pressed", async () => {
    const { unmount, getByText } = render(
      <EvaluationList history={mockHistory} onDelete={mockOnDelete} />
    );
    await waitFor(() => {
      fireEvent.press(getByText("85.00%"));
    });
    expect(await mockRouterPush).toHaveBeenCalledWith({
      pathname: "/score",
      params: {
        score: "85",
        comment: "Good score",
        date: "2024-10-17T10:00:00Z",
        video: "video-url-1",
      },
    });
    await unmount();
  });

  it("calls onDelete when the delete button is pressed", async () => {
    const { unmount, getByTestId } = render(
      <EvaluationList history={mockHistory} onDelete={mockOnDelete} />
    );

    await waitFor(() => {
      fireEvent.press(getByTestId("trash-2024-10-17T10:00:00Z")); // Press the delete button for the first item
    });
    expect(await mockOnDelete).toHaveBeenCalledWith("2024-10-17T10:00:00Z");
    await unmount();
  });
});
