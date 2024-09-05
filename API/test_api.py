import base64
from DataScripts.process.video_rotation import detect_rotation
from DataScripts.process.flow import flow
import time
from API.validate import validate_video

if __name__ == "__main__":
    with open("./API/movie2.mp4", "rb") as video_file:
        video_bytes = video_file.read()
        video_base64 = base64.b64encode(video_bytes).decode("utf-8")

    start_time = time.time()
    validate_video(video_bytes)
    end_time = time.time()

    execution_time = end_time - start_time
    print(f"Czas wykonania: {execution_time:.6f} sekund")

# response = requests.post("http://192.168.0.192:8000/video/", json={"video": video_base64})

# print(response.json())
# video_bytes = base64.b64decode(video_base64)
# detect_rotation(video_bytes)
