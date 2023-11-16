import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastPress, setLastPress] = useState(null);

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

      setLoading(true);

      let photo = await cameraRef.takePictureAsync();
      setCapturedImage(photo.uri);
      
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
          setLoading(false);
          Alert.alert(
            'Smile Checker',
            'Smile is ' + response.data.result + '% genuine.',
            [
              {
                text: 'Ok',
                onPress: () => setCapturedImage(null),
                style: 'cancel',
              },
            ],
            { cancelable: false },
          );
        })
        .catch(error => {
          console.error('Błąd podczas wysyłania zdjęcia:', error);
          setLoading(false); // Zakończ ładowanie w przypadku błędu
        });
    } catch (error) {
      Alert.alert('Błąd', error.message);
      setLoading(false); // Zakończ ładowanie w przypadku błędu
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

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={cameraType}
        ref={(ref) => setCameraRef(ref)}
      >
        <TouchableOpacity
          style={styles.touchableOpacity}
          onPress={onPress}
          activeOpacity={1}
        >
          {capturedImage ? (
            <View style={{ flex: 1 }}>
              <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
              {loading && (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator style={styles.loader} size="large" color="white" />
                </View>
              )}
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={takePicture}
              >
                <Text style={styles.buttonText}>Take Photo</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  touchableOpacity: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
  },
  capturedImage: {
    flex: 1,
  },
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
  loaderContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -25,
  },
  loader: {
    position: 'absolute',
  },
});
