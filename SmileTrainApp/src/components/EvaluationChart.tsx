import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Text, Dimensions } from "react-native";
import { LineChart } from 'react-native-chart-kit'; 
import { fetchHistory } from "../hooks/fetchHistory";
import Evaluation from "../interfaces/Evaluation";
import processChartData from "../functions/processChartData";
import { Period } from "../types/Period";

const screenWidth = Dimensions.get("window").width;

export default function EvaluationChart() {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [{ data: [] }],
    });
    const [selectedPeriod, setSelectedPeriod] = useState<Period>("week");
    const [history, setHistory] = useState<Evaluation[]>([]);
    const [rangeText, setRangeText] = useState<string>("");  // To display date range under chart

    useEffect(() => {
        setChartData(processChartData(history, selectedPeriod));
    }, [selectedPeriod, history]);

    useEffect(() => {
        const loadHistory = async () => {
            const history = await fetchHistory();
            setHistory(history);
        };
        loadHistory();
    }, []);

    return (
    <View>
        <View style={styles.buttonContainer}>
            {["week", "month", "year"].map(period => (
            <TouchableOpacity
                key={period}
                style={[
                styles.periodButton,
                selectedPeriod === period && styles.activeButton,
                ]}
                onPress={() => setSelectedPeriod(period as Period)}
            >
                <Text style={styles.buttonText}>{period.charAt(0).toUpperCase() + period.slice(1)}</Text>
            </TouchableOpacity>
            ))}
        </View>

        <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
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

        <Text style={styles.rangeText}>{rangeText}</Text>
      </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 10,
    },
    periodButton: {
      padding: 10,
      borderRadius: 10,
      backgroundColor: '#ccc',
    },
    activeButton: {
      backgroundColor: '#ffa726',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    chart: {
      marginVertical: 10,
      borderRadius: 16,
    },
    rangeText: {
      textAlign: 'center',
      marginTop: 10,
      fontSize: 14,
      color: '#666',
    },
  });
