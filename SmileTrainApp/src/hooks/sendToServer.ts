import { Alert } from "react-native";
import { VIDEO_API_URL, PHOTO_API_URL } from "../config/config";
import * as FileSystem from "expo-file-system";
export async function sendVideoToServer(videoUri) {
  try {
    // Read the video file as a base64 encoded string
    const base64Video = await FileSystem.readAsStringAsync(videoUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Prepare the payload
    const payload = {
      video: base64Video,
    };
    console.log(JSON.stringify(payload))
    // Send the base64-encoded video string to the server in a JSON object
    const response = await fetch(VIDEO_API_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Response status: ", response.status);
    // Check if the upload was successful
    if (!response.ok) {
      throw new Error("Upload failed: " + response.statusText);
    }

    // Optionally, handle the response
    const result = await response.json();
    Alert.alert("Success", "Smile authenticity: " + result.result + "%");
  } catch (error) {
    // Handle errors
    Alert.alert("Error", "Failed to upload video. Please try again.");
    console.error(error);
  }
}

export async function sendPhotoToServer(videoUri: string) {
  try {
    // Create a FormData object to send the video file
    const formData = new FormData();
    formData.append("video", {
      uri: videoUri,
      type: "video/mp4", // Adjust this based on your video type
      name: "video.mp4",
    });

    // Send the video to the server
    const response = await fetch(PHOTO_API_URL, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Check if the upload was successful
    if (!response.ok) {
      throw new Error("Upload failed: " + response.statusText);
    }

    // Optionally, handle the response
    const result = await response.json();
    Alert.alert("Success", "Video uploaded successfully!");
  } catch (error) {
    // Handle errors
    Alert.alert("Error", "Failed to upload video. Please try again.");
    console.error(error);
  }
}
