import getProgressBarColor from '../getProgressBarColor';
import chroma from 'chroma-js';

describe('getProgressBarColor', () => {
  it('should return the correct color for scores less than or equal to 50', () => {
    expect(getProgressBarColor(0)).toBe(chroma.mix("#F44336", "#FFEB3B", 0 / 50, "rgb").hex());
    expect(getProgressBarColor(25)).toBe(chroma.mix("#F44336", "#FFEB3B", 25 / 50, "rgb").hex());
    expect(getProgressBarColor(50)).toBe(chroma.mix("#F44336", "#FFEB3B", 50 / 50, "rgb").hex());
  });

  it('should return the correct color for scores greater than 50', () => {
    expect(getProgressBarColor(51)).toBe(chroma.mix("#FFEB3B", "#4CAF50", (51 - 50) / 50, "rgb").hex());
    expect(getProgressBarColor(75)).toBe(chroma.mix("#FFEB3B", "#4CAF50", (75 - 50) / 50, "rgb").hex());
    expect(getProgressBarColor(100)).toBe(chroma.mix("#FFEB3B", "#4CAF50", (100 - 50) / 50, "rgb").hex());
  });

  it('should return a color for scores less than 0', () => {
    expect(getProgressBarColor(-10)).toBe(chroma.mix("#F44336", "#FFEB3B", -10 / 50, "rgb").hex());
  });

  it('should return a color for scores greater than 100', () => {
    expect(getProgressBarColor(110)).toBe(chroma.mix("#FFEB3B", "#4CAF50", (110 - 50) / 50, "rgb").hex());
  });
});