import os
import numpy as np
from unittest.mock import patch, MagicMock
from DataScripts.scripts.a_movie_to_frames import (
    save_frame,
    movie_to_frames,
)
from DataScripts.config import TMP_DIR


@patch("cv2.imwrite")
def test_save_frame(mock_imwrite):
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    frame_name = "frame0.jpg"
    save_frame(frame, frame_name)
    mock_imwrite.assert_called_once_with(frame_name, frame)


@patch("os.makedirs")
@patch("os.chdir")
@patch("os.path.exists")
@patch("cv2.VideoCapture")
@patch("cv2.destroyAllWindows")
def test_movie_to_frames(
    mock_destroyAllWindows,
    mock_VideoCapture,
    mock_exists,
    mock_chdir,
    mock_makedirs,
):
    mock_exists.return_value = False
    mock_video_capture = MagicMock()
    mock_video_capture.read.side_effect = [
        (
            True,
            np.zeros((100, 100, 3), dtype=np.uint8),
        ),
        (True, np.zeros((100, 100, 3), dtype=np.uint8)),
        (False, None),
    ]
    mock_VideoCapture.return_value = mock_video_capture
    video_id = 1
    video_name = "test_video.mp4"
    frames_dir = os.path.abspath(
        os.path.join(os.sep, TMP_DIR, str(video_id), "frames")
    )
    video_path = os.path.abspath(
        os.path.join(os.sep, TMP_DIR, str(video_id), video_name)
    )
    movie_to_frames(video_id, video_name)
    mock_exists.assert_called_once_with(frames_dir)
    mock_makedirs.assert_called_once_with(frames_dir)
    mock_chdir.assert_called_once_with(frames_dir)
    mock_VideoCapture.assert_called_once_with(video_path)
    assert mock_video_capture.read.call_count == 3
    mock_destroyAllWindows.assert_called_once()


@patch("os.makedirs")
@patch("os.chdir")
@patch("os.path.exists")
@patch("cv2.VideoCapture")
@patch("cv2.destroyAllWindows")
def test_movie_to_frames_existing_dir(
    mock_destroyAllWindows,
    mock_VideoCapture,
    mock_exists,
    mock_chdir,
    mock_makedirs,
):
    mock_exists.return_value = True
    mock_video_capture = MagicMock()
    mock_video_capture.read.side_effect = [
        (
            True,
            np.zeros((100, 100, 3), dtype=np.uint8),
        ),
        (False, None),
    ]
    mock_VideoCapture.return_value = mock_video_capture
    video_id = 1
    video_name = "test_video.mp4"
    frames_dir = os.path.abspath(
        os.path.join(os.sep, TMP_DIR, str(video_id), "frames")
    )
    movie_to_frames(video_id, video_name)
    mock_makedirs.assert_not_called()
    mock_exists.assert_called_once_with(frames_dir)
    mock_chdir.assert_called_once_with(frames_dir)
    mock_destroyAllWindows.assert_called_once()
