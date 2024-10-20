import os
import dlib
import pytest
import numpy as np
from unittest.mock import patch, MagicMock
from DataScripts.scripts.b_detect_faces import (
    save_face,
    process_frame,
    detect_faces,
)
from DataScripts.config import TMP_DIR

MOCK_FRAMES_DIR = "/mock/frames"
MOCK_FACES_DIR = "/mock/faces"
MOCK_FRAME_NAME = "frame1.jpg"


@patch("cv2.imwrite")
def test_save_face_success(mock_imwrite):
    face_image = np.zeros((100, 100, 3), dtype=np.uint8)
    save_face(face_image, "face1.jpg")
    mock_imwrite.assert_called_once_with("face1.jpg", face_image)


@patch("cv2.imwrite", side_effect=Exception("File write error"))
def test_save_face_failure(mock_imwrite):
    face_image = np.zeros((100, 100, 3), dtype=np.uint8)
    with pytest.raises(Exception, match="File write error"):
        save_face(face_image, "face1.jpg")


@patch("cv2.imread")
@patch("cv2.cvtColor")
@patch("cv2.imwrite")
@patch("DataScripts.scripts.b_detect_faces.get_face_aligner")
@patch("DataScripts.scripts.b_detect_faces.get_detector")
def test_process_frame_success(
    mock_get_detector,
    mock_get_face_aligner,
    mock_imwrite,
    mock_cvtcolor,
    mock_imread,
):
    mock_imread.return_value = np.zeros((100, 100, 3), dtype=np.uint8)
    mock_detector = MagicMock()
    mock_detector.return_value = [dlib.rectangle(0, 0, 50, 50)]
    mock_get_detector.return_value = mock_detector
    mock_face_aligner = MagicMock()
    mock_face_aligner.align.return_value = np.zeros(
        (100, 100, 3), dtype=np.uint8
    )
    mock_get_face_aligner.return_value = mock_face_aligner
    error = process_frame(MOCK_FRAME_NAME, MOCK_FRAMES_DIR, MOCK_FACES_DIR)
    assert error is None
    mock_imwrite.assert_called_once_with(
        os.path.join(MOCK_FACES_DIR, MOCK_FRAME_NAME),
        mock_face_aligner.align.return_value,
    )


@patch("cv2.imread", return_value=None)
def test_process_frame_image_not_loaded(mock_imread):
    error = process_frame(MOCK_FRAME_NAME, MOCK_FRAMES_DIR, MOCK_FACES_DIR)
    expected_error = "Image /mock/frames\\frame1.jpg could not be loaded."
    assert expected_error in error


@patch("cv2.imread")
@patch("DataScripts.scripts.b_detect_faces.get_detector")
def test_process_frame_no_face_detected(mock_get_detector, mock_imread):
    mock_imread.return_value = np.zeros((100, 100, 3), dtype=np.uint8)
    mock_detector = MagicMock()
    mock_detector.return_value = []
    mock_get_detector.return_value = mock_detector
    error = process_frame(MOCK_FRAME_NAME, MOCK_FRAMES_DIR, MOCK_FACES_DIR)
    assert "No face detected in frame1.jpg" in error


@patch("cv2.imread")
@patch("DataScripts.scripts.b_detect_faces.get_detector")
def test_process_frame_multiple_faces_detected(mock_get_detector, mock_imread):
    mock_imread.return_value = np.zeros((100, 100, 3), dtype=np.uint8)
    mock_detector = MagicMock()
    mock_detector.return_value = [
        dlib.rectangle(0, 0, 50, 50),
        dlib.rectangle(60, 60, 100, 100),
    ]
    mock_get_detector.return_value = mock_detector
    error = process_frame(MOCK_FRAME_NAME, MOCK_FRAMES_DIR, MOCK_FACES_DIR)
    assert "More than one face detected in frame1.jpg" in error


@patch(
    "DataScripts.scripts.b_detect_faces.get_all_filenames",
    return_value=["frame1.jpg", "frame2.jpg"],
)
@patch("os.makedirs")
@patch("os.path.exists", return_value=False)
@patch("DataScripts.scripts.b_detect_faces.process_frame")
def test_detect_faces(
    mock_process_frame, mock_exists, mock_makedirs, mock_get_all_filenames
):
    video_id = 1
    video_name = "test_video.mp4"
    mock_process_frame.side_effect = [
        None,
        "Error in frame2.jpg",
    ]
    detect_faces(video_id, video_name)
    mock_exists.assert_called_once_with(
        os.path.join(TMP_DIR, str(video_id), "faces")
    )
    mock_makedirs.assert_called_once_with(
        os.path.join(TMP_DIR, str(video_id), "faces")
    )
    mock_get_all_filenames.assert_called_once_with(
        os.path.join(TMP_DIR, str(video_id), "frames")
    )
    assert mock_process_frame.call_count == 2
    mock_process_frame.assert_any_call(
        "frame1.jpg",
        os.path.join(TMP_DIR, str(video_id), "frames"),
        os.path.join(TMP_DIR, str(video_id), "faces"),
    )
    mock_process_frame.assert_any_call(
        "frame2.jpg",
        os.path.join(TMP_DIR, str(video_id), "frames"),
        os.path.join(TMP_DIR, str(video_id), "faces"),
    )
