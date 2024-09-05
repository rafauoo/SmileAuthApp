import uvicorn
import base64
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from model.lstm import SmileAuthenticityPredictor
from model.evaluate import evaluate_data
from DataScripts.process.flow import flow
from DataScripts.exceptions import SmileNotDetectedException
from API.config import API_CKPT_PATH
from API.definitions import VideoData
from API.exceptions import VideoTooLongException
from API.validate import validate_video


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
            API_CKPT_PATH, num_classes=2, num_features=39
        )
        model.eval()
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model.to(device)
        video_bytes = base64.b64decode(data.video)
        print("ASAS")
        try:
            validate_video(video_bytes)
            print("TSS")
            angles = flow(video_bytes)
        except SmileNotDetectedException:
            return {"result": "Smile was not detected!"}
        except VideoTooLongException:
            return {"result": "Video was too long!"}
        result = evaluate_data(model, device, angles)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="192.168.0.192", port=8000)
