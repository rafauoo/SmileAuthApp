import * as FileSystem from "expo-file-system";

export default async function saveVideoLocally(videoUri: string | null): Promise<{ success: boolean; localUri?: string | null}> {
  try {
    if (!videoUri) {
      return { success: false };
    }
    
    const fileName = videoUri.split("/").pop();
    const localUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.copyAsync({
      from: videoUri,
      to: localUri,
    });

    return { success: true, localUri };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error saving video locally:", error.message);
      return { success: false };
    } else {
      console.error("An unknown error occurred while saving video:", error);
      return { success: false };
    }
  }
}
