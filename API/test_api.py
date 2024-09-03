import requests
import base64
from API.rotate_mp4 import detect_rotation
from API.apiflow import flow

# from API.flow import flow
import time

if __name__ == "__main__":
    with open("./API/movie1.mp4", "rb") as video_file:
        video_bytes = video_file.read()
        video_base64 = base64.b64encode(video_bytes).decode("utf-8")

    start_time = time.time()
    result = flow(video_bytes)
    end_time = time.time()
    execution_time = end_time - start_time
    print(f"Czas wykonania: {execution_time:.6f} sekund")
    print(result)
# response = requests.post("http://192.168.0.192:8000/video/", json={"video": video_base64})

# print(response.json())
# video_bytes = base64.b64decode(video_base64)
# detect_rotation(video_bytes)
