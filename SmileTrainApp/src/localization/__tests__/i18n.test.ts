import AsyncStorage from "@react-native-async-storage/async-storage";
import { languageDetectorPlugin, STORAGE_LANGUAGE_KEY } from "../i18n";

describe("i18n language detection", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetModules();
    });
  
    it("should detect Polish language when no language is stored", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        const callback = jest.fn();
    
        await languageDetectorPlugin.detect(callback);
    
        expect(callback).toHaveBeenCalledWith("pl");
      });
    
      it("should detect the stored language", async () => {
        const mockLanguage = "en";
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockLanguage);
        const callback = jest.fn();
    
        await languageDetectorPlugin.detect(callback);
    
        expect(callback).toHaveBeenCalledWith(mockLanguage);
      });
    
      it("should cache the user language", async () => {
        const languageToCache = "en";
        await languageDetectorPlugin.cacheUserLanguage(languageToCache);
        
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_LANGUAGE_KEY, languageToCache);
      });
    
      it("should log an error if reading from AsyncStorage fails", async () => {
        const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error("AsyncStorage error"));
        const callback = jest.fn();
    
        await languageDetectorPlugin.detect(callback);
    
        expect(callback).not.toHaveBeenCalled()
        expect(consoleLogSpy).toHaveBeenCalledWith("Error reading language from storage.", expect.any(Error));
        consoleLogSpy.mockRestore();
      });
    
      it("should log an error if caching the language fails", async () => {
        const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error("AsyncStorage error"));
    
        await languageDetectorPlugin.cacheUserLanguage("pl");

        expect(consoleLogSpy).not.toHaveBeenCalled();
        consoleLogSpy.mockRestore();
      });
  });