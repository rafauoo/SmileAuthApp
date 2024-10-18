import { Dimensions } from 'react-native';

function getWindowDimensions() {
  return Dimensions.get('window');
}

export function getHeight() {
  return getWindowDimensions().height;
}

export function getWidth() {
  return getWindowDimensions().width;
}

export function getWindowHeight() {
  const height = getHeight();
  let numerator;
  const denominator = 850;
  
  if (height < 600) numerator = 600;
  else if (height > 1100) numerator = 1100;
  else numerator = height;
  
  return Math.floor((numerator / denominator) * 100) / 100;
}

export function dimensions(value: number, suffix: string): string {
  const size = value * getWindowHeight();
  return size + suffix;
}
