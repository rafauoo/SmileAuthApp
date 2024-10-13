import { renderHook, act } from '@testing-library/react-hooks';
import useAppLoading from '../useAppLoading';
import { useFonts } from '@expo-google-fonts/roboto';

jest.mock('@expo-google-fonts/roboto', () => ({
  useFonts: jest.fn(),
}));

describe('useAppLoading', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false when fonts are not loaded', () => {
    (useFonts as jest.Mock).mockReturnValue([false]);
    const { result } = renderHook(() => useAppLoading());
    expect(result.current).toBe(false);
  });

  it('should return true when fonts are loaded', async () => {
    (useFonts as jest.Mock).mockReturnValue([true]);
    const { result } = renderHook(() => useAppLoading());
    await act(async () => {
      result.current;
    });
    expect(result.current).toBe(true);
  });

});
