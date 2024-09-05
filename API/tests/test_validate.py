from API.validate import get_video_length, validate_video, VideoTooLongException
import cv2
import numpy as np
import os
import tempfile
import pytest
import av

def create_test_video(duration_ms: int, fps: int) -> bytes:
    width, height = 640, 480
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
    video_path = temp_file.name
    temp_file.close()
    
    out = cv2.VideoWriter(video_path, fourcc, fps, (width, height))
    
    num_frames = int(duration_ms / 1000 * fps)
    for _ in range(num_frames):
        frame = np.random.randint(0, 256, (height, width, 3), dtype=np.uint8)
        out.write(frame)
    
    out.release()
    
    with open(video_path, 'rb') as f:
        video_bytes = f.read()
    
    os.remove(video_path)
    
    return video_bytes

def test_get_video_length_valid():
    video_bytes = create_test_video(2000, 30)
    duration, fps = get_video_length(video_bytes)
    assert duration == 2000
    assert fps == 30

def test_get_video_length_non_standard_fps():
    video_bytes = create_test_video(1000, 29)
    duration, fps = get_video_length(video_bytes)
    assert duration == 1000
    assert fps == 29

def test_get_video_length_empty():
    video_bytes = b''
    with pytest.raises(av.AVError):
        get_video_length(video_bytes)

def test_get_video_length_invalid_data():
    video_bytes = b'not a valid video file'
    with pytest.raises(av.AVError):
        get_video_length(video_bytes)

def test_validate_video_valid():
    video_bytes = create_test_video(500, 30)
    try:
        validate_video(video_bytes)
    except VideoTooLongException:
        pytest.fail("validate_video() raised VideoTooLongException unexpectedly")

def test_validate_video_too_long():
    video_bytes = create_test_video(15000, 30)
    with pytest.raises(VideoTooLongException):
        validate_video(video_bytes)

def test_validate_video_empty():
    video_bytes = b''
    with pytest.raises(ValueError):
        validate_video(video_bytes)

def test_validate_video_invalid_data():
    video_bytes = b'not a valid video file'
    with pytest.raises(ValueError):
        validate_video(video_bytes)
