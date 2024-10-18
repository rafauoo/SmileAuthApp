import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import EvaluationChart from "../EvaluationChart";
import processChartData from "../../functions/processChartData";
import { LineChartProps } from "react-native-chart-kit/dist/line-chart/LineChart";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
}));

jest.mock("../../functions/processChartData", () => {
  return jest.fn();
});

jest.mock("react-native-chart-kit", () => ({
  LineChart: jest.fn(() => null),
}));

describe("EvaluationChart Component", () => {
  const mockHistory = [
    {
      score: 80,
      comment: { pl: "Dobrze", en: "Good" },
      date: "2023-10-01",
      video: "video1.mp4",
    },
    {
      score: 90,
      comment: { pl: "Super", en: "Excellent" },
      date: "2023-10-02",
      video: "video2.mp4",
    },
  ];

  const mockProcessedData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{ data: [80, 90] }],
  };

  beforeEach(() => {
    (processChartData as jest.Mock).mockReturnValue(mockProcessedData);
  });

  it("should render correctly when history is loaded", () => {
    const { getByText } = render(
      <EvaluationChart history={mockHistory} isHistoryLoaded={true} />
    );

    expect(getByText("Screens.menu.chart.week")).toBeTruthy();
    expect(getByText("Screens.menu.chart.month")).toBeTruthy();
    expect(getByText("Screens.menu.chart.year")).toBeTruthy();
  });

  it("should not render correctly when history is not loaded", () => {
    const { getByTestId } = render(
      <EvaluationChart history={mockHistory} isHistoryLoaded={false} />
    );

    expect(getByTestId("view_empty")).toBeTruthy();
  });

  it("should toggle period when the buttons are pressed", () => {
    const { getByTestId } = render(
      <EvaluationChart history={mockHistory} isHistoryLoaded={true} />
    );

    const weekButton = getByTestId("screens.menu.chart.week-button");
    const monthButton = getByTestId("screens.menu.chart.month-button");

    expect(weekButton).toHaveStyle({
      backgroundColor: "#FF8940",
    });

    fireEvent.press(monthButton);

    expect(monthButton).toHaveStyle({
      backgroundColor: "#FF8940",
    });

    expect(weekButton).toHaveStyle({
      backgroundColor: "#ffffff",
    });
  });
});
