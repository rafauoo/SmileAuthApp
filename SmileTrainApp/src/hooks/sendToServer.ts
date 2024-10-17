import { VIDEO_API_URL } from "../config/config";
import * as FileSystem from "expo-file-system";
import SendVideoResult from "../interfaces/SendVideoResult";

export async function sendVideoToServer(videoUri: string): Promise<SendVideoResult> {
  try {
    const base64Video = await FileSystem.readAsStringAsync(videoUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const payload = {
      video: base64Video,
    };

    const response = await fetch(VIDEO_API_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    console.log("Response status: ", response.status);

    if (!response.ok) {
      const result = await response.json();
      return {
        success: false,
        error: result.detail.error,
      };
    }

    const result = await response.json();
    return {
      success: true,
      result: result.result,
      comment: result.comment,
    };
  } catch (error: unknown) {
    if (error instanceof TypeError) {
      console.error("Network error while sending video:", error.message);
      return {
        success: false,
        error: "apiNotAvailable",
        nonStandard: false,
      };
    } else if (error instanceof Error) {
      console.error("Error sending video:", error.message);
      return {
        success: false,
        error: error.message,
        nonStandard: true,
      };
    } else {
      console.error("An unknown error occurred while sending video:", error);
      return {
        success: false,
        error: "An unknown error occurred.",
        nonStandard: true,
      };
    }
  }
}