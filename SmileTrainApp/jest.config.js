module.exports = {
    preset: 'react-native',
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
      '^.+\\.jsx?$': 'babel-jest',
    },
    transformIgnorePatterns: [
      'node_modules/(?!(expo-modules-core|expo-file-system|@react-native|react-native|react-native-button|@react-native-community|@callstack/react-theme-provider|expo-splash-screen))',
    ],    
    testEnvironment: 'node',
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|css|scss)$': '<rootDir>/__mocks__/fileMock.js',
    },
  };
  