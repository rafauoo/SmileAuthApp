import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [cameraType, setCameraType] = useState('back');
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastPress, setLastPress] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageWithFaces, setImageWithFaces] = useState(null);

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
      const serverUrl = 'http://192.168.0.135:8000/upload/';

      axios.post(serverUrl, data, headers)
        .then(response => {
          setImageWithFaces(`data:image/jpeg;base64,${response.data}`);
          console.log(response.data)
          setCapturedImage(null);
          setImageModalVisible(true);
          setLoading(false);
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
    console.log("aa")
    setCameraType(
      cameraType === 'back'
        ? 'front'
        : 'back'
    );
  };
  const okPhoto = () => {
    setImageModalVisible(false);
    setCapturedImage(null);
  }
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
      <CameraView
        style={styles.camera}
        facing={cameraType}
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
          ) : imageModalVisible ? (
            <View style={{ flex: 1 }}>
              <Image source={{ uri: imageWithFaces }} style={styles.capturedImage} />
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={okPhoto}
                  >
                    <Text style={styles.buttonText}>OK</Text>
                  </TouchableOpacity>
              </View>
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
      </CameraView>
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
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  buttonContainer: {
    position: 'absolute', // Position the container absolutely
    bottom: 0, // Align it to the bottom
    width: '100%', // Take full width

    padding: 20,
    alignItems: 'center', // Center the button horizontally
    justifyContent: 'center', // Center the button vertically
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
