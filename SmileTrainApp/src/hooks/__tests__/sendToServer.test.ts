import { sendVideoToServer } from "../sendToServer";
import * as FileSystem from "expo-file-system";

jest.mock("expo-file-system", () => ({
  readAsStringAsync: jest.fn(),
}));

jest.mock("expo-file-system", () => ({
  readAsStringAsync: jest.fn(),
  EncodingType: {
    Base64: "base64",
  },
}));

global.fetch = jest.fn();

describe("sendVideoToServer", () => {
  const videoUri = "test-uri";
  const base64Video = "base64-encoded-video";
  const mockFetchResponse = (status: number, body: any) =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should send video and return success result", async () => {
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(base64Video);
    (global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse(200, { result: "Video saved", comment: "Success" })
    );

    const result = await sendVideoToServer(videoUri);

    expect(FileSystem.readAsStringAsync).toHaveBeenCalledWith(videoUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    expect(global.fetch).toHaveBeenCalledWith(expect.any(String), {
      method: "POST",
      body: JSON.stringify({ video: base64Video }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    expect(result).toEqual({
      success: true,
      result: "Video saved",
      comment: "Success",
    });
  });

  it("should return an error if the server responds with an error", async () => {
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(base64Video);
    (global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse(400, { detail: { error: "Invalid request" } })
    );

    const result = await sendVideoToServer(videoUri);

    expect(result).toEqual({
      success: false,
      error: "Invalid request",
    });
  });

  it("should handle network error and return apiNotAvailable", async () => {
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(base64Video);
    (global.fetch as jest.Mock).mockRejectedValue(
      new TypeError("Network error")
    );

    const result = await sendVideoToServer(videoUri);

    expect(result).toEqual({
      success: false,
      error: "apiNotAvailable",
      nonStandard: false,
    });
  });

  it("should handle unknown errors gracefully", async () => {
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(base64Video);
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Unknown error"));

    const result = await sendVideoToServer(videoUri);

    expect(result).toEqual({
      success: false,
      error: "Unknown error",
      nonStandard: true,
    });
  });

  it("should handle completely unknown error types", async () => {
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(base64Video);
    (global.fetch as jest.Mock).mockRejectedValue("Some strange error");

    const result = await sendVideoToServer(videoUri);

    expect(result).toEqual({
      success: false,
      error: "An unknown error occurred.",
      nonStandard: true,
    });
  });
});
