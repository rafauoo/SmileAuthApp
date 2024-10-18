import * as FileSystem from "expo-file-system";
import saveVideoLocally from "../saveVideoLocally";

jest.mock("expo-file-system", () => ({
    copyAsync: jest.fn(),
    documentDirectory: "mocked/document/directory/",
}));

describe("saveVideoLocally", () => {
    const mockVideoUri = "video.mp4";
    const mockFileName = "video.mp4";
    const mockLocalUri = `${FileSystem.documentDirectory}${mockFileName}`;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should save the video locally and return the local URI", async () => {
        (FileSystem.copyAsync as jest.Mock).mockResolvedValueOnce(undefined);

        const result = await saveVideoLocally(mockVideoUri);

        expect(result).toEqual({
            success: true,
            localUri: mockLocalUri,
        });
        expect(FileSystem.copyAsync).toHaveBeenCalledWith({
            from: mockVideoUri,
            to: mockLocalUri,
        });
    });

    it("should return success false if videoUri is null", async () => {
        const result = await saveVideoLocally(null);

        expect(result).toEqual({
            success: false,
        });
        expect(FileSystem.copyAsync).not.toHaveBeenCalled();
    });

    it("should return success false if an error occurs during file copy", async () => {
        (FileSystem.copyAsync as jest.Mock).mockRejectedValueOnce(new Error("File system error"));

        const result = await saveVideoLocally(mockVideoUri);

        expect(result).toEqual({
            success: false,
        });
        expect(FileSystem.copyAsync).toHaveBeenCalledWith({
            from: mockVideoUri,
            to: mockLocalUri,
        });
    });

    it("should handle unknown errors during file copy", async () => {
        (FileSystem.copyAsync as jest.Mock).mockRejectedValueOnce("This is a string error");

        const result = await saveVideoLocally(mockVideoUri);

        expect(result).toEqual({
            success: false,
        });
        expect(FileSystem.copyAsync).toHaveBeenCalledWith({
            from: mockVideoUri,
            to: mockLocalUri,
        });
    });
});
