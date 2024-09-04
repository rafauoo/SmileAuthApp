import uvicorn
import base64
import os
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from model.model_lstm import SmileAuthenticityPredictor
from model.analyze_video import analyze_video
from API.config import API_MODEL_DIR
from API.definitions import VideoData


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
checkpoint_path = os.path.join(os.sep, API_MODEL_DIR, f"checkpoint.ckpt")


@app.post("/video/")
async def upload_video(data: VideoData) -> dict:
    """Upload video POST function.

    :param data: video data (encoded bytes)
    :type data: VideoData
    :raises HTTPException: sends HTTP 500 when exception occured
    :return: result of a video analysis
    :rtype: dict {"result": probability}
    """
    try:
        model = SmileAuthenticityPredictor.load_from_checkpoint(
            "./API/model/checkpoint.ckpt", num_classes=2, num_features=39
        )
        model.eval()
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model.to(device)
        video_bytes = base64.b64decode(data.video)
        result = analyze_video(model, device, video_bytes)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="192.168.0.192", port=8000)
