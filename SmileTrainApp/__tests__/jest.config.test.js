const jestConfig = require('../jest.config.js');

describe('Jest Config', () => {
    it('should have the correct preset', () => {
      expect(jestConfig.preset).toBe('react-native');
    });
  });