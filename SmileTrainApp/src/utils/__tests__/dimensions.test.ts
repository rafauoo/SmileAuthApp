import { dimensions, getWindowHeight, getHeight, getWidth } from '../dimensions';
import { Dimensions } from 'react-native';

jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(),
  },
}));

describe('Window dimensions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the correct height when height is mocked', () => {
    (Dimensions.get as jest.Mock).mockReturnValue({ height: 500, width: 375 });
    expect(getHeight()).toBe(500);
  });

  it('should return the correct width when width is mocked', () => {
    (Dimensions.get as jest.Mock).mockReturnValue({ height: 500, width: 375 });
    expect(getWidth()).toBe(375);
  });
});

describe('getWindowHeight', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 600 when window height is less than 600', () => {
    (Dimensions.get as jest.Mock).mockReturnValue({ height: 500, width: 375 });
    expect(getWindowHeight()).toBe(0.7);
  });

  it('should return 1100 when window height is more than 1100', () => {
    (Dimensions.get as jest.Mock).mockReturnValue({ height: 1200, width: 375 });
    expect(getWindowHeight()).toBe(1.29);
  });

  it('should return the actual height when it is between 600 and 1100', () => {
    (Dimensions.get as jest.Mock).mockReturnValue({ height: 900, width: 375 });
    expect(getWindowHeight()).toBe(1.05);
  });
});

describe('dimensions function', () => {
  it('should return the correct value with suffix for height less than 600', () => {
    (Dimensions.get as jest.Mock).mockReturnValue({ height: 500, width: 375 });
    const result = dimensions(10, 'px');
    expect(result).toBe('7px');
  });

  it('should return the correct value with suffix for height greater than 1100', () => {
    (Dimensions.get as jest.Mock).mockReturnValue({ height: 1200, width: 375 });
    const result = dimensions(10, 'px');
    expect(result).toBe('12.9px');
  });

  it('should return the correct value with suffix for height between 600 and 1100', () => {
    (Dimensions.get as jest.Mock).mockReturnValue({ height: 900, width: 375 });
    const result = dimensions(10, 'px');
    expect(result).toBe('10.5px');
  });
});
