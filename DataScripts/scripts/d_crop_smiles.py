import os
import sys
import json
from fraction import Fraction
import cv2

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from config import TMP_DIR, CURRENT_MIN_NUM_SMILE_FRAMES


def scale_frames(orig_len, req_len, beg_frame_num):
    fr = Fraction(orig_len, req_len)
    num, denom = fr.numerator, fr.denominator
    scaled_frames_nums = [i // denom + beg_frame_num for i in range(0, denom * orig_len, num)]
    return scaled_frames_nums

def crop_smiles(id, video_name):
    with open(os.path.join(os.sep, TMP_DIR, str(id), 'smiles_data.json'), 'r') as fp:
        smiles_data = json.load(fp)
        num_smiles_frames = smiles_data['num_smiles_frames']
        beg_frame = smiles_data['smile_beg_frame']
        _scaled_frames_nums = scale_frames(num_smiles_frames, CURRENT_MIN_NUM_SMILE_FRAMES, beg_frame)
    print(_scaled_frames_nums)
    print(f'**********************************************\n{video_name}\n')
    video_smile_dir = os.path.abspath(os.path.join(TMP_DIR, str(id), "smiles"))
    video_faces_dir = os.path.abspath(os.path.join(TMP_DIR, str(id), "faces"))
    if not os.path.exists(video_smile_dir):
        os.makedirs(video_smile_dir)

    os.chdir(video_smile_dir)
    chosen_frames = _scaled_frames_nums
    for frame_num in chosen_frames:
        img_title = f'frame{frame_num}.jpg'
        img_path = os.path.abspath(os.path.join(os.sep, video_faces_dir, img_title))
        img = cv2.imread(img_path)
        cv2.imwrite(img_title, img)