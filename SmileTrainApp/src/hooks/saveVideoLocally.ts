import * as FileSystem from "expo-file-system";

export default async function saveVideoLocally(videoUri: string | null) {
  try {
    if (!videoUri) {
      return null;
    }
    const fileName = videoUri.split("/").pop();
    const localUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.copyAsync({
      from: videoUri,
      to: localUri,
    });

    return localUri;
  } catch (error) {
    console.error("Error saving video locally:", error);
    return null;
  }
}
