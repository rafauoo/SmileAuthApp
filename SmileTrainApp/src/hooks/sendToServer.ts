import VIDEO_API_URL from "../config/config";
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
      return { error: result.detail.error, success: false }
    }

    const result = await response.json();
    return { result: result.result, success: true, comment: result.comment }
  } catch (error) {
    console.error(error);
    return { error: String(error), success: false, nonStandard: true }
  }
}
