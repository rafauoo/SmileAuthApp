import torch
import numpy as np
import pandas as pd
from typing import List
import torch.nn.functional as F
from model.model_lstm import SmileAuthenticityPredictor
from DataScripts.flow.flow import flow
from torch import device

def analyze_video(model: SmileAuthenticityPredictor, device: device, video_bytes: bytes) -> float:
    angles = flow(video_bytes)
    if isinstance(angles, pd.DataFrame):
        angles = angles.to_numpy()
    elif isinstance(angles, list):
        angles = np.array(angles)
    features_tensor = torch.tensor(angles, dtype=torch.float32)
    features_tensor = features_tensor.transpose(0, 1)
    features_tensor = features_tensor.to(device)
    _, output = model(features_tensor)
    probabilities = F.softmax(output, dim=1)
    authentic_smile_prob = probabilities[0][1].item()
    authentic_smile_percentage = authentic_smile_prob * 100
    return authentic_smile_percentage