import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Dimensions,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import Evaluation from "../interfaces/Evaluation";
import processChartData from "../functions/processChartData";
import ChartData from "../interfaces/ChartData";
import { useTranslation } from "react-i18next";
import Labels from "../interfaces/Labels";
import { defaultChartConfig } from "../config/config";

const screenWidth = Dimensions.get("window").width;

interface Props {
  history: Evaluation[];
  isHistoryLoaded: boolean;
  chartConfig?: {
    color: (opacity: number) => string;
    labelColor: (opacity: number) => string;
  };
}

export default function EvaluationChart({
  history,
  isHistoryLoaded,
  chartConfig,
}: Props) {
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [{ data: [] }],
  });

  const config = { ...defaultChartConfig, ...chartConfig };
  const { t, i18n } = useTranslation();
  const labels: Labels = {
    week: [
      t("screens.menu.chart.xaxis.week.mon"),
      t("screens.menu.chart.xaxis.week.tue"),
      t("screens.menu.chart.xaxis.week.wed"),
      t("screens.menu.chart.xaxis.week.thu"),
      t("screens.menu.chart.xaxis.week.fri"),
      t("screens.menu.chart.xaxis.week.sat"),
      t("screens.menu.chart.xaxis.week.sun"),
    ],
    year: [
      t("screens.menu.chart.xaxis.year.jan"),
      t("screens.menu.chart.xaxis.year.feb"),
      t("screens.menu.chart.xaxis.year.mar"),
      t("screens.menu.chart.xaxis.year.apr"),
      t("screens.menu.chart.xaxis.year.may"),
      t("screens.menu.chart.xaxis.year.jun"),
      t("screens.menu.chart.xaxis.year.jul"),
      t("screens.menu.chart.xaxis.year.aug"),
      t("screens.menu.chart.xaxis.year.sep"),
      t("screens.menu.chart.xaxis.year.oct"),
      t("screens.menu.chart.xaxis.year.nov"),
      t("screens.menu.chart.xaxis.year.dec"),
    ],
  };
  const periodList = [
    t("screens.menu.chart.week"),
    t("screens.menu.chart.month"),
    t("screens.menu.chart.year"),
  ];
  const [selectedPeriod, setSelectedPeriod] = useState<string>(periodList[0]);

  useEffect(() => {
    setChartData(processChartData(history, selectedPeriod, periodList, labels));
  }, [selectedPeriod, history]);

  return (
    <View>
      <View style={styles.buttonContainer}>
        {periodList.map((period) => (
          <TouchableOpacity
            key={period}
            testID={`${period}-button`}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.activeButton,
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              style={[
                styles.buttonText,
                selectedPeriod === period && styles.activeButtonText,
              ]}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {isHistoryLoaded ? (
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          yAxisSuffix="%"
          fromZero={true}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#FF8940",
            backgroundGradientTo: "#FA8F2B",
            decimalPlaces: 0,
            color: config.color,
            labelColor: config.labelColor,
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#FF8940",
            },
            propsForVerticalLabels: {
              fontSize: 10,
            },
          }}
          bezier
          style={styles.chart}
        />
      ) : (
        <View testID="view_empty"></View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  periodButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    marginVertical: 2,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  activeButton: {
    backgroundColor: "#FF8940",
  },
  activeButtonText: {
    color: "#FFFFFF",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  chart: {
    marginVertical: 10,
    borderRadius: 16,
  },
  rangeText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
});
