import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { ProgressBar } from "react-native-paper";
import { useLocalSearchParams, useRouter } from 'expo-router';
import IconButton from '../src/components/IconButton';
import { PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import { PanGestureHandler} from "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function ScoreScreen() {
    const { score, comment, date } = useLocalSearchParams<{ score: string, comment: string, date: string }>();
    const scoreNum = Number(score);
    const router = useRouter();
    const [isNavigating, setIsNavigating] = React.useState<boolean>(false);
    
    const handleGoBack = () => {
        router.push("/menu");
    };

    function handleSwipeRight(event: PanGestureHandlerGestureEvent) {
        if (event.nativeEvent.translationX > 100 && !isNavigating) {
          setIsNavigating(true);
          router.push("/menu");
        }
      }
    
    console.log(scoreNum)
    if (score && comment) {
        return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <PanGestureHandler onGestureEvent={handleSwipeRight}>
                <View style={styles.container}>
                    <Text style={styles.title}>Your score</Text>
                    <ProgressBar 
                        progress={scoreNum}
                        color={scoreNum > 0.7 ? "green" : scoreNum > 0.4 ? "yellow" : "red"}
                        style={styles.progressBar}
                    />
                    <Text style={styles.scoreText}>{(Math.round(scoreNum*100)/100).toFixed(2)}%</Text>
                    <Text style={styles.comment}>{comment}</Text>
                    
                    <IconButton
                        onPress={handleGoBack}
                        iosName={"list.bullet"}
                        androidName="home"
                        color="white"
                        containerPadding={15}
                        containerWidth={75}
                        iconSize={45}
                    />
                </View>
            </PanGestureHandler>
        </GestureHandlerRootView>
        );
    }

    return null;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    progressBar: {
        height: 20,
        width: "100%",
        borderRadius: 10,
        marginBottom: 20,
    },
    scoreText: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 10,
    },
    comment: {
        fontSize: 16,
        textAlign: "center",
        color: "#333",
    },
});
