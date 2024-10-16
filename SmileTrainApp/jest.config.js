module.exports = {
    preset: 'react-native',
    transform: {
      '^.+\\.[tj]sx?$': 'babel-jest',
    },
    transformIgnorePatterns: [
      'node_modules/(?!(expo-modules-core|expo-file-system|@react-native|react-native|react-native-button|@react-native-community|@expo/vector-icons|@callstack/react-theme-provider|expo-splash-screen|expo-symbols)/)',
    ],    
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|css|scss)$': '<rootDir>/__mocks__/fileMock.js',
        "^@expo/vector-icons/(.*)$": "<rootDir>/node_modules/@expo/vector-icons/build/$1",
        '^@/(.*)$': '<rootDir>/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
    collectCoverage: true,
    collectCoverageFrom: [
      "**/*.{ts,tsx,js,jsx}",
      "!**/coverage/**",
      "!**/node_modules/**",
      "!**/babel.config.js",
      "!**/expo-env.d.ts",
      "!**/.expo/**"
    ]
  };
  