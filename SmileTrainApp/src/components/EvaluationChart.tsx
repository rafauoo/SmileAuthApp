import React from "react"
import { View, TouchableOpacity, StyleSheet, Text, Dimensions } from "react-native"
import { LineChart } from 'react-native-chart-kit'; 

const screenWidth = Dimensions.get("window").width;

export default function EvaluationChart() {
    const [chartData, setChartData] = React.useState({
        labels: [],
        datasets: [{ data: [] }],
    });
    const [selectedPeriod, setSelectedPeriod] = React.useState<string>("week");
    
    const periodData = {
        week: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            data: [80, 85, 90, 78, 88, 94, 70],
        },
        month: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            data: [75, 82, 88, 90],
        },
        year: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            data: [70, 75, 80, 85, 90, 95, 100, 80, 85, 90, 92, 88],
        },
    };

    React.useEffect(() => {
        const { labels, data } = periodData[selectedPeriod];
        setChartData({
          labels,
          datasets: [
            {
              data,
              color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
              strokeWidth: 2,
            },
          ],
        });
      }, [selectedPeriod]);
    
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
                onPress={() => setSelectedPeriod(period)}
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
  });
  