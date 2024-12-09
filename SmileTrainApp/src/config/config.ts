const VIDEO_API_URL = "http://192.168.0.192:8000/video/";

const chartColor = "255, 255, 255";
const labelChartColor = "255, 255, 255";

const getColor = (opacity: number) => `rgba(${chartColor}, ${opacity})`;
const getLabelColor = (opacity: number) =>
  `rgba(${labelChartColor}, ${opacity})`;

export { VIDEO_API_URL, getColor, getLabelColor };
