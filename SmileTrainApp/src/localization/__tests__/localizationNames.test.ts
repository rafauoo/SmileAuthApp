import { languageNames } from "../localizationNames";

describe("languageNames", () => {
  it("should contain the correct language names", () => {
    expect(languageNames).toEqual({
      en: "English",
      pl: "Polski",
    });
  });

  it("should contain only the expected keys", () => {
    const expectedKeys = ["en", "pl"];
    expect(Object.keys(languageNames)).toEqual(expect.arrayContaining(expectedKeys));
  });

  it("should not contain unexpected keys", () => {
    const unexpectedKeys = ["de", "fr", "es"];
    unexpectedKeys.forEach((key) => {
      expect(languageNames).not.toHaveProperty(key);
    });
  });
});
