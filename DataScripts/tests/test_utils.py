import os
import numpy as np
import re
from unittest import mock
from DataScripts.utils import (
    landmarks_to_np,
    get_current_time_str,
    get_all_filenames,
    get_filenames_sorted_by_frame_num,
    get_frame_num,
    save_dict_to_json_file,
)

DATA_DIR = "/mock_data_dir"


def test_landmarks_to_np():
    shape = mock.MagicMock()
    shape.part.side_effect = lambda i: mock.Mock(x=i, y=i * 2)
    result = landmarks_to_np(shape)
    expected = np.array([[i, i * 2] for i in range(68)], dtype="int")
    np.testing.assert_array_equal(result, expected)


def test_get_current_time_str():
    with mock.patch("time.strftime", return_value="20241020-120000"):
        assert get_current_time_str() == "20241020-120000"


@mock.patch("os.listdir")
@mock.patch("os.path.isfile")
def test_get_all_filenames(mock_isfile, mock_listdir):
    mock_listdir.return_value = ["file1.txt", "file2.txt", "._hidden"]
    mock_isfile.side_effect = lambda x: not x.endswith("._hidden")
    result = get_all_filenames("/some/dir")
    assert result == ["file1.txt", "file2.txt"]


@mock.patch("DataScripts.utils.get_all_filenames")
@mock.patch("DataScripts.utils.get_frame_num")
def test_get_filenames_sorted_by_frame_num(
    mock_get_frame_num, mock_get_all_filenames
):
    mock_get_all_filenames.return_value = ["frame1.png", "frame2.png"]
    mock_get_frame_num.side_effect = lambda name: int(
        re.search(r"frame(\d+)", name).group(1)
    )
    result = get_filenames_sorted_by_frame_num("/some/dir")
    assert result == ["frame1.png", "frame2.png"]


def test_get_frame_num():
    assert get_frame_num("frame123.png") == 123


@mock.patch("builtins.open", new_callable=mock.mock_open)
@mock.patch(
    "DataScripts.utils.get_current_time_str", return_value="20241020-120000"
)
def test_save_dict_to_json_file(mock_time_str, mock_open):
    data = {"key": "value"}
    expected_path = os.path.abspath(
        os.path.join("/some/path", "testfile-20241020-120000.json")
    )
    save_dict_to_json_file("/some/path", "testfile", data)
    mock_open.assert_called_once_with(expected_path, "w")
