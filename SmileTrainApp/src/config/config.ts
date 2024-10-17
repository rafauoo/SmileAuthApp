const VIDEO_API_URL = "http://192.168.0.192:8000/video/"


const defaultChartConfig = {
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  };

export { VIDEO_API_URL, defaultChartConfig };