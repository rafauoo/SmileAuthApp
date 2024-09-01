import requests
import base64

with open("./API/video2.mp4", "rb") as video_file:
    video_bytes = video_file.read()
    video_base64 = base64.b64encode(video_bytes).decode('utf-8')

response = requests.post("http://192.168.0.192:8000/video/", json={"video": video_base64})

print(response.json())