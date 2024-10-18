import { getColor, getLabelColor } from '../config';

describe('Constants', () => {
    it('should return correct RGBA for getColor with opacity 1', () => {
        expect(getColor(1)).toBe('rgba(255, 255, 255, 1)');
      });
    
      it('should return correct RGBA for getColor with opacity 0', () => {
        expect(getColor(0)).toBe('rgba(255, 255, 255, 0)');
      });
    
      it('should return correct RGBA for getLabelColor with opacity 1', () => {
        expect(getLabelColor(1)).toBe('rgba(255, 255, 255, 1)');
      });
    
      it('should return correct RGBA for getLabelColor with opacity 0', () => {
        expect(getLabelColor(0)).toBe('rgba(255, 255, 255, 0)');
      });
});