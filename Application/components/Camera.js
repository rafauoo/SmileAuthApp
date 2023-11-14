import React, { useState } from 'react';
import { View, Button } from 'react-native';

const CameraScreen = ({ onCapture }) => {
  const [camera, setCamera] = useState(null);

  const takePicture = async () => {
    if (camera) {
      const options = { quality: 0.5, base64: true };
      const data = await camera.takePictureAsync(options);
      onCapture(data);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
        <Button title="Take Picture" onPress={takePicture} />
      </View>
    </View>
  );
};

export default CameraScreen;