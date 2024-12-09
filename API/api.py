import uvicorn
import base64
import random
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from model.lstm import SmileAuthenticityPredictor
from model.evaluate import evaluate_data
from DataScripts.process.flow import flow
from DataScripts.exceptions import SmileNotDetectedException
from API.config import API_CKPT_PATH, COMMENTS_PATH
from API.definitions import VideoData
from API.exceptions import VideoTooLongException
from API.validate import validate_video
from API.comment import CommentList

CommentList.from_file(COMMENTS_PATH)
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
        validate_video(video_bytes)
        angles = flow(video_bytes)
        result = evaluate_data(model, device, angles)
        comment = random.choice(CommentList.available_comments(result))
        return {"result": result, "comment": comment.get_content()}
    except SmileNotDetectedException as e:
        raise HTTPException(
            status_code=400,
            detail={"statusText": str(e), "error": "SmileNotDetected"},
        )

    except VideoTooLongException as e:
        raise HTTPException(
            status_code=400,
            detail={"statusText": str(e), "error": "VideoTooLong"},
        )

    except Exception as e:
        print(data)
        print(str(e))
        raise HTTPException(
            status_code=500,
            detail={"statusText": str(e), "error": "Exception"},
        )


if __name__ == "__main__":
    uvicorn.run(app, host="172.20.10.5", port=8000)
