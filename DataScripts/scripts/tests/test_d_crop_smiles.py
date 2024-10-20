import pytest
from unittest.mock import patch, mock_open
import json
from DataScripts.scripts.d_crop_smiles import (
    crop_smiles,
    scale_frames,
    get_first_39_smile_frames,
)


def test_get_first_39_smile_frames_success():
    result = list(get_first_39_smile_frames(10, 40))
    assert result == list(range(10, 49))


def test_get_first_39_smile_frames_failure():
    with pytest.raises(ValueError, match="Not enough smile frames"):
        get_first_39_smile_frames(10, 38)


def test_scale_frames():
    result = scale_frames(40, 10, 5)
    expected = [5, 9, 13, 17, 21, 25, 29, 33, 37, 41]
    assert result == expected


@patch("os.makedirs")
@patch("os.path.exists", return_value=False)
@patch("os.chdir")
@patch("cv2.imread", return_value="image_data")
@patch("cv2.imwrite")
@patch(
    "builtins.open",
    new_callable=mock_open,
    read_data=json.dumps({"num_smiles_frames": 40, "smile_beg_frame": 5}),
)
def test_crop_smiles(
    mock_open,
    mock_imwrite,
    mock_imread,
    mock_chdir,
    mock_exists,
    mock_makedirs,
):
    crop_smiles(1, "test_video.mp4")
    mock_makedirs.assert_called_once()
    assert mock_imread.call_count == 39
    assert mock_imwrite.call_count == 39
