import numpy as np
import pandas as pd
from DataScripts.config import (
    NUM_FACES_FEATURES,
    LIPS_CORNER1_IDX,
    LIPS_CORNER2_IDX,
    NOSE_TOP_IDX,
)
from unittest.mock import mock_open, patch, MagicMock
from DataScripts.scripts.e_smiles_to_csv_data import (
    smiles_to_csv,
    prepare_angle_data,
    save_landmarks_row,
    create_ff_data_file_writer,
    header,
    angle_between,
)


def test_angle_between():
    v1 = (1, 0)
    v2 = (0, 1)
    result = angle_between(v1, v2)
    expected = np.pi / 2  # 90 degrees
    assert np.isclose(result, expected)


@patch("builtins.open", new_callable=mock_open)
@patch("csv.writer")
def test_create_ff_data_file_writer(mock_csv_writer, mock_open):
    filepath = "/path/to/file.csv"
    mock_writer = mock_csv_writer.return_value
    file_handle, writer = create_ff_data_file_writer(filepath)
    mock_open.assert_called_once_with(filepath, "w", newline="")
    mock_csv_writer.assert_called_once_with(file_handle, delimiter=";")
    mock_writer.writerow.assert_called_once_with(header)


def test_save_landmarks_row():
    mock_writer = MagicMock()
    mock_landmarks = MagicMock()

    def mock_part(index):
        return MagicMock(x=10 + index, y=20 + index)

    mock_landmarks.part.side_effect = mock_part
    frame_number = 5
    save_landmarks_row(mock_writer, mock_landmarks, frame_number)
    expected_row = [frame_number]
    for i in range(NUM_FACES_FEATURES):
        expected_row.append(10 + i)
        expected_row.append(20 + i)
    mock_writer.writerow.assert_called_once_with(expected_row)


def test_prepare_angle_data():
    data = pd.DataFrame(
        {
            f"{LIPS_CORNER1_IDX}x": [1, 2],
            f"{LIPS_CORNER1_IDX}y": [1, 2],
            f"{LIPS_CORNER2_IDX}x": [3, 4],
            f"{LIPS_CORNER2_IDX}y": [3, 4],
            f"{NOSE_TOP_IDX}x": [2, 3],
            f"{NOSE_TOP_IDX}y": [1, 2],
        }
    )
    result = prepare_angle_data(data)
    assert "lips_corners_from_nose_angle" in result.columns


@patch("builtins.open", new_callable=mock_open)
@patch("cv2.imread", return_value="mock_image")
@patch("cv2.cvtColor", return_value="mock_gray")
@patch("dlib.get_frontal_face_detector")
@patch("dlib.shape_predictor")
@patch("pandas.read_csv", return_value=pd.DataFrame({"col": []}))
@patch(
    "DataScripts.scripts.e_smiles_to_csv_data.prepare_angle_data",
    return_value=pd.DataFrame(
        {
            f"{LIPS_CORNER1_IDX}x": [1, 2],
            f"{LIPS_CORNER1_IDX}y": [1, 2],
            f"{LIPS_CORNER2_IDX}x": [3, 4],
            f"{LIPS_CORNER2_IDX}y": [3, 4],
            f"{NOSE_TOP_IDX}x": [2, 3],
            f"{NOSE_TOP_IDX}y": [1, 2],
        }
    ),
)
@patch("pandas.DataFrame.to_csv")
@patch("os.listdir", return_value=["frame1.jpg", "frame2.jpg"])
@patch("os.path.isfile", return_value=True)
def test_smiles_to_csv(
    mock_isfile,
    mock_listdir,
    mock_to_csv,
    mock_read_csv,
    mock_prepare_angle_data,
    mock_shape_predictor,
    mock_detector,
    mock_cvtColor,
    mock_imread,
    mock_open,
):
    mock_detector.return_value = MagicMock()
    mock_shape_predictor.return_value = MagicMock()
    mock_detector.return_value.__getitem__.return_value = MagicMock()

    smiles_to_csv(1, "test_video.mp4")

    mock_open.assert_called()
    mock_imread.assert_called()
    mock_cvtColor.assert_called()
    mock_detector.assert_called()
    mock_shape_predictor.assert_called()
    mock_read_csv.assert_called_once()
    mock_to_csv.assert_called_once()
