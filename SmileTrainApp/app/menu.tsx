import React from "react";
import { View, Text, StyleSheet } from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter, useFocusEffect } from "expo-router";
import { PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import EvaluationList from "@/src/components/EvaluationList";
import EvaluationChart from "@/src/components/EvaluationChart";
import { Alert } from "react-native";
import { deleteEvaluation } from "@/src/hooks/deleteEvaluation";
import { useState } from "react";
import Evaluation from "@/src/interfaces/Evaluation";
import { fetchHistory } from "@/src/hooks/fetchHistory";
import { useEffect } from "react";

export default function MenuScreen() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [history, setHistory] = useState<Evaluation[]>([]);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      setIsHistoryLoaded(false);
      const fetchedHistory = await fetchHistory();
      setHistory(fetchedHistory);
      setIsHistoryLoaded(true);
    };
    loadHistory();
  }, []);

  function handleSwipeRight(event: PanGestureHandlerGestureEvent) {
    if (event.nativeEvent.translationX < -100 && !isNavigating) {
      setIsNavigating(true);
      router.push("/main");
    }
  }

  async function handleDelete(date: string) {
    Alert.alert(
        "Are you sure?",
        "This action will permanently delete the evaluation from the history.",
        [
            {
                text: "Cancel",
                style: "cancel"
            },
            {
                text: "OK",
                onPress: async () => {
                    const newHistory = await deleteEvaluation(history, date);
                    setHistory(newHistory);
                }
            }
        ]
    );
  }

  useFocusEffect(
    React.useCallback(() => {
      setIsNavigating(false);
    }, [])
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler onGestureEvent={handleSwipeRight}>
        <View style={styles.container}>
          <Text style={styles.title}>Average Smile Authenticity (%)</Text>
          <EvaluationChart history={history} isHistoryLoaded={isHistoryLoaded}/>
          <Text style={styles.subTitle}>Evaluation History</Text>
          <EvaluationList history={history} onDelete={handleDelete}/>
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 20,
    textAlign: 'center',
  },
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
  subTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 10,
  },
  chart: {
    marginVertical: 10,
    borderRadius: 16,
  },
});
