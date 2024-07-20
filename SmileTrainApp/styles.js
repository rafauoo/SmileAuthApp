import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  touchableOpacity: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
  },
  capturedImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  buttonContainer: {
    position: "absolute", // Position the container absolutely
    bottom: 0, // Align it to the bottom
    width: "100%", // Take full width

    padding: 20,
    alignItems: "center", // Center the button horizontally
    justifyContent: "center", // Center the button vertically
  },
  button: {
    fontSize: 18,
    color: "white",
    backgroundColor: "green",
    padding: 30,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    color: "black",
  },
  loaderContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -25,
    marginTop: -25,
  },
  loader: {
    position: "absolute",
  },
});
export default styles;
