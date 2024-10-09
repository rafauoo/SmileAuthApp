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

const screenWidth = Dimensions.get("window").width;

interface Props {
  history: Evaluation[];
  isHistoryLoaded: boolean;
}

export default function EvaluationChart({ history, isHistoryLoaded }: Props) {
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [{ data: [] }],
  });
  const { t, i18n } = useTranslation();
  const labels: Labels = {
    week: [t("screens.menu.chart.xaxis.week.mon"),
      t("screens.menu.chart.xaxis.week.tue"),
      t("screens.menu.chart.xaxis.week.wed"),
      t("screens.menu.chart.xaxis.week.thu"),
      t("screens.menu.chart.xaxis.week.fri"),
      t("screens.menu.chart.xaxis.week.sat"),
      t("screens.menu.chart.xaxis.week.sun"),
    ],
    year: [t("screens.menu.chart.xaxis.year.jan"),
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
  }
  const periodList = [
    t("screens.menu.chart.week"),
    t("screens.menu.chart.month"),
    t("screens.menu.chart.year"),
  ]
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
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.activeButton,
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={styles.buttonText}>
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
          chartConfig={{
            backgroundColor: "#e26a00",
            backgroundGradientFrom: "#fb8c00",
            backgroundGradientTo: "#ffa726",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726",
            },
          }}
          bezier
          style={styles.chart}
        />
      ) : (
        <View></View>
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
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#ccc",
  },
  activeButton: {
    backgroundColor: "#ffa726",
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
