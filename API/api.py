from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import base64
import numpy as np
import cv2
from typing import List
import torch
from model.model_lstm import SmileAuthenticityPredictor
#from API.flow import flow
import torch.nn.functional as F
from model.model_config import CLASSES_STRS
from API.rotate_mp4 import detect_rotation
from API.apiflow import flow

app = FastAPI()
model = SmileAuthenticityPredictor.load_from_checkpoint("./API/model/checkpoint.ckpt", num_classes=2, num_features=39)
model.eval()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

class ImageData(BaseModel):
    image: str

class VideoData(BaseModel):
    video: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/video/")
async def upload_video(data: VideoData):
    try:
        video_bytes = base64.b64decode(data.video)
        print(detect_rotation(video_bytes))
        save_video(video_bytes, "new.mp4")
        #print(video_bytes)
        result = analyze_video(video_bytes)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/video_bulk/")
async def upload_video_bulk(data: VideoData):
    try:
        video_bytes = base64.b64decode(data.video)
        #print(video_bytes)
        result = get_video_data(video_bytes)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def save_video(video_bytes: bytes, save_path: str):
    """
    Save the video to the given path.

    Parameters:
    - video_bytes: Byte stream of the video.
    - save_path: Path where the video will be saved.
    """
    with open(save_path, 'wb') as f:
        f.write(video_bytes)

def analyze_video(video_bytes: bytes) -> List[dict]:
    try:
        angles = flow(video_bytes)
        import pandas as pd
        if isinstance(angles, pd.DataFrame):
            angles = angles.to_numpy()
        elif isinstance(angles, list):
            angles = np.array(angles)
        features_tensor = torch.tensor(angles, dtype=torch.float32)
        print(angles)
        features_tensor = features_tensor.transpose(0, 1)
        features_tensor = features_tensor.to(device)
        _, output = model(features_tensor)
        probabilities = F.softmax(output, dim=1)
        print(probabilities)
        authentic_smile_prob = probabilities[0][1].item()
        authentic_smile_percentage = authentic_smile_prob * 100
        return {"result": authentic_smile_percentage}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_video_data(video_bytes: bytes) -> List[dict]:
    try:
        angles = flow(video_bytes)
        import pandas as pd
        if isinstance(angles, pd.DataFrame):
            angles = angles.to_numpy()
        elif isinstance(angles, list):
            angles = np.array(angles)
        return {"result": angles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="192.168.0.192", port=8000)
