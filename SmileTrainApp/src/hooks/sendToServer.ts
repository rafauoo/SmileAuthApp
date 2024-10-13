import VIDEO_API_URL from "../config/config";
import * as FileSystem from "expo-file-system";
export async function sendVideoToServer(videoUri: string) {
  try {
    const base64Video = await FileSystem.readAsStringAsync(videoUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const payload = {
      video: base64Video,
    };
    // console.log(JSON.stringify(payload))

    const response = await fetch(VIDEO_API_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Response status: ", response.status);

    if (!response.ok) {
      throw new Error("Upload failed: " + response.statusText);
    }

    const result = await response.json();
    console.log(result)
    if (result.result === "Smile was not detected!")
      return { success: false }
    return { result: result.result, success: true}
  } catch (error) {
    console.error(error);
    return { success: false }
  }
}
