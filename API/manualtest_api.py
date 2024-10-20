import base64
from DataScripts.process.video_rotation import detect_rotation
import requests

if __name__ == "__main__":
    with open("./API/movie.mp4", "rb") as video_file:
        video_bytes = video_file.read()
        video_base64 = base64.b64encode(video_bytes).decode("utf-8")

response = requests.post(
    "http://192.168.0.192:8000/video/", json={"video": video_base64}
)

print(response.json())
video_bytes = base64.b64decode(video_base64)
detect_rotation(video_bytes)
