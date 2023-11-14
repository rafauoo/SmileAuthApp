import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [lastPress, setLastPress] = useState(0);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    try {
      if (!cameraRef) {
        throw new Error('Brak dostępu do kamery');
      }

      let photo = await cameraRef.takePictureAsync();

      const base64 = await FileSystem.readAsStringAsync(photo.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const headers = {
        'Content-Type': 'application/json',
      };
      const data = {
        image: base64,
      };
      const serverUrl = 'http://192.168.0.135:7000/SmileChecker/upload/';

      axios.post(serverUrl, data, headers)
        .then(response => {
          console.log('Zdjęcie zostało wysłane na serwer:', response.data);
        })
        .catch(error => {
          console.error('Błąd podczas wysyłania zdjęcia:', error);
        });
    } catch (error) {
      Alert.alert('Błąd', error.message);
    }
  };
  const switchCameraType = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const onPress = () => {
    const currentTime = new Date().getTime();
    const delta = currentTime - lastPress;

    if (delta < 300) {
      // Jeżeli czas między kliknięciami jest mniejszy niż 300ms, uznajemy to za podwójne kliknięcie
      console.log("ADAA")
      switchCameraType();
    }

    setLastPress(currentTime);
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>Brak dostępu do kamery</Text>;
  }
  const styles = StyleSheet.create({
    buttonContainer: {
      flex: 1,
      alignSelf: 'flex-end',
      alignItems: 'center',
      marginBottom: 40,
    },
    button: {
      fontSize: 18,
      color: 'white',
      backgroundColor: 'green',
      padding: 30,
      borderRadius: 5,
    },
    buttonText: {
      fontSize: 18,
      color: 'white',
    },
    touchableArea: {
      flex: 1,
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={{ flex: 1 }}
        type={cameraType}
        ref={(ref) => setCameraRef(ref)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'transparent', flexDirection: 'row'}}
          onPress={onPress}
          activeOpacity={1}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={takePicture}
            >
              <Text style={styles.buttonText}>Zrób Zdjęcie</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Camera>
    </View>
  );
  
}
