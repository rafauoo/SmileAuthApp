import os
import cv2
import json
from fraction import Fraction
from typing import Iterator
from DataScripts.config import TMP_DIR


def get_first_39_smile_frames(
    smile_beg_frame: int, num_smiles_frames: int
) -> Iterator[int]:
    """Calculates frames IDs of smile.

    :param smile_beg_frame: beginning frame ID
    :type smile_beg_frame: int
    :param num_smiles_frames: number of frames to be included in smile
    :type num_smiles_frames: int
    :raises ValueError: can be thrown when there is too few frames in a smile
    :return: _description_
    :rtype: _type_
    """
    if num_smiles_frames >= 39:
        smile_start = smile_beg_frame
        smile_end = smile_beg_frame + 38
        return range(smile_start, smile_end + 1)
    else:
        raise ValueError("Not enough smile frames")


def scale_frames(orig_len: int, req_len: int, beg_frame_num: int) -> list:
    """Scales smile frames duration.

    :param orig_len: original length
    :type orig_len: int
    :param req_len: required length
    :type req_len: int
    :param beg_frame_num: _description_
    :type beg_frame_num: int
    :return: scaled frame IDs
    :rtype: list
    """
    fr = Fraction(orig_len, req_len)
    num, denom = fr.numerator, fr.denominator
    scaled_frames_nums = [
        i // denom + beg_frame_num for i in range(0, denom * orig_len, num)
    ]
    return scaled_frames_nums


def crop_smiles(id: int, video_name: str) -> None:
    """Crop smiles from frames and saves them into image files.

    :param id: video ID
    :type id: int
    :param video_name: video name
    :type video_name: str
    """
    with open(
        os.path.join(os.sep, TMP_DIR, str(id), "smiles_data.json"), "r"
    ) as fp:
        smiles_data = json.load(fp)
        num_smiles_frames = smiles_data["num_smiles_frames"]
        beg_frame = smiles_data["smile_beg_frame"]
        _scaled_frames_nums = get_first_39_smile_frames(
            beg_frame, num_smiles_frames
        )
    print(_scaled_frames_nums)
    print(f"**********************************************\n{video_name}\n")
    video_smile_dir = os.path.abspath(os.path.join(TMP_DIR, str(id), "smiles"))
    video_faces_dir = os.path.abspath(os.path.join(TMP_DIR, str(id), "faces"))
    if not os.path.exists(video_smile_dir):
        os.makedirs(video_smile_dir)

    os.chdir(video_smile_dir)
    chosen_frames = _scaled_frames_nums
    for frame_num in chosen_frames:
        img_title = f"frame{frame_num}.jpg"
        img_path = os.path.abspath(
            os.path.join(os.sep, video_faces_dir, img_title)
        )
        img = cv2.imread(img_path)
        cv2.imwrite(img_title, img)
