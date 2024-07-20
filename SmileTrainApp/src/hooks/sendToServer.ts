import { Alert } from "react-native";
import PHOTO_API_URL from "../config/config";
export async function sendVideoToServer(videoUri: string) {
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
