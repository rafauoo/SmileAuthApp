import React from 'react';
import { View, Text, Image } from 'react-native';

const ResultScreen = ({ result }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Result:</Text>
      <Image source={{ uri: result }} style={{ width: 200, height: 200, marginTop: 20 }} />
    </View>
  );
};

export default ResultScreen;
