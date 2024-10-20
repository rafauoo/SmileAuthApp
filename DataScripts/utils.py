import time
import numpy as np
import os
import re
import json
from DataScripts.config import DATA_DIR
import dlib


def rename_videos() -> None:
    """Rename videos from DATA_DIR/videos_new."""
    for num, file in enumerate(
        os.listdir(
            os.path.abspath(os.path.join(os.sep, DATA_DIR, "videos_new"))
        )
    ):
        e_file = os.path.abspath(
            os.path.join(os.sep, DATA_DIR, "videos_new", file)
        )
        if "deliberate" in file:
            os.rename(
                e_file,
                os.path.join(
                    os.sep,
                    DATA_DIR,
                    "videos_new",
                    f"{num+1:04}_deliberate.mp4",
                ),
            )
        if "spontaneous" in file:
            os.rename(
                e_file,
                os.path.join(
                    os.sep,
                    DATA_DIR,
                    "videos_new",
                    f"{num+1:04}_spontaneous.mp4",
                ),
            )


def landmarks_to_np(
    shape: dlib.full_object_detection, dtype: str = "int"
) -> np.ndarray:
    """Changes landmarks to coordinates.

    :param shape: object detection
    :type shape: dlib.full_object_detection
    :param dtype: type of coordinates, defaults to "int"
    :type dtype: str, optional
    :return: coordinates
    :rtype: np.ndarray
    """
    coords = np.zeros((68, 2), dtype=dtype)
    for i in range(0, 68):
        coords[i] = (shape.part(i).x, shape.part(i).y)
    return coords


def get_current_time_str() -> str:
    """Get current time.

    :return: current time
    :rtype: str
    """
    return time.strftime("%Y%m%d-%H%M%S")


def get_all_filenames(directory: str) -> list:
    """Get all filenames from directory.

    :param directory: directory path
    :type directory: str
    :return: list of filenames
    :rtype: list
    """
    return list(
        filter(
            None,
            [
                f
                for f in os.listdir(directory)
                if os.path.isfile(os.path.join(directory, f)) and f[:2] != "._"
            ],
        )
    )


def get_filenames_sorted_by_frame_num(directory: str) -> list:
    """Get all filenames sorted by frame num from given directory.

    :param directory: directory path
    :type directory: str
    :return: sorted list
    :rtype: list
    """
    return sorted(get_all_filenames(directory), key=lambda n: get_frame_num(n))


def get_frame_num(name: str) -> int:
    """Get frame number from its name.

    :param name: frame name
    :type name: str
    :return: frame number
    :rtype: int
    """
    return int(re.search(r"frame(\d+)", name).group(1))


def save_dict_to_json_file(
    path: str, title: str, data: dict, time_str: str | None = None
) -> None:
    """Saves dict to json.

    :param path: saving path
    :type path: str
    :param title: title of json file
    :type title: str
    :param data: data dict
    :type data: dict
    :param time_str: time string, defaults to None
    :type time_str: str | None, optional
    """
    if time_str is None:
        time_str = get_current_time_str()
        with open(
            os.path.abspath(
                os.path.join(os.sep, path, f"{title}-{time_str}.json")
            ),
            "w",
        ) as f:
            json.dump(data, f, indent=4)
        print("\nData successfully saved into the json file.\n")
    else:
        with open(
            os.path.abspath(os.path.join(os.sep, path, title)), "w"
        ) as f:
            json.dump(data, f, indent=4)
