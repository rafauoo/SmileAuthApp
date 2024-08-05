import os
import sys
import cv2
import dlib
import numpy as np
import matplotlib.pyplot as plt
import json
from config import TMP_DIR
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import FACES_FEATURES_DET_FP, LIPS_CORNER1_IDX, LIPS_CORNER2_IDX, BEG_SMILE_THRESHOLD, \
    END_SMILE_THRESHOLD, NUM_FRAMES_RISE_SMILE_BEG, \
    MIN_DIFF_IN_RISE_SMILE_BEG, SMILE_DURATION_MIN_RATIO
from utils import get_filenames_sorted_by_frame_num, get_frame_num, save_dict_to_json_file

def detect_smiles(id, video_name):
    detector = dlib.get_frontal_face_detector()
    predictor = dlib.shape_predictor(FACES_FEATURES_DET_FP)
    faces_dir = os.path.abspath(os.path.join(os.sep, TMP_DIR, str(id), "faces"))
    faces_names = get_filenames_sorted_by_frame_num(faces_dir)

    first_dist = None
    diffs_in_time = []

    print(f'**********************************************\n{video_name}\n')

    for face_name in faces_names:
        face_path = os.path.abspath(os.path.join(os.sep, faces_dir, face_name))

        img = cv2.imread(face_path)
        gray = cv2.cvtColor(src=img, code=cv2.COLOR_BGR2GRAY)
        _frame_number = get_frame_num(face_name)

        face = detector(gray)[0]

        _landmarks = predictor(image=gray, box=face)

        x1 = _landmarks.part(LIPS_CORNER1_IDX).x
        y1 = _landmarks.part(LIPS_CORNER1_IDX).y

        x2 = _landmarks.part(LIPS_CORNER2_IDX).x
        y2 = _landmarks.part(LIPS_CORNER2_IDX).y

        dY = y2 - y1
        dX = x2 - x1
        dist = np.sqrt((dX ** 2) + (dY ** 2))

        if first_dist is None:
            first_dist = dist

        curr_diff = abs(dist - first_dist)

        diffs_in_time.append({
            'frame': _frame_number,
            'diff': curr_diff
        })

    # finding top of the chart (to be able to find the end of the smile - It has to be after the top of
    # the chart.)
    filtered_diffs = [_dict for _dict in diffs_in_time if _dict['diff'] is not None]
    sorted_diffs = sorted(filtered_diffs, key=lambda d: d['diff'])
    biggest_diff_frame = sorted_diffs[-1]['frame']

    # finding beginning and end of the smile
    beg_found, end_found = False, False
    smile_beg_frame, smile_end_frame, num_smiles_frames = None, None, None
    num_frames = len(faces_names)

    try:
        for i in range(1, len(diffs_in_time)-1):  # From 1 because first value is always None.
            dY = diffs_in_time[i+1]['diff'] - diffs_in_time[i]['diff']  # dX = 1 (frames difference)

            diff = diffs_in_time[i+1]['diff']

            rise_diffs = []
            if beg_found is False:
                for x in range(1, NUM_FRAMES_RISE_SMILE_BEG+1):
                    # IndexError can happen here:
                    rise_diffs.append(diffs_in_time[i+x]['diff'])

            if beg_found is False and dY > BEG_SMILE_THRESHOLD and \
                    all(rise_diff > (diffs_in_time[i]['diff'] + MIN_DIFF_IN_RISE_SMILE_BEG)
                        for rise_diff in rise_diffs):
                # beginning of the smile found (slope of the line (differences between the current lips corners
                # location and the lips corners location in the first frame) > BEG_SMILE_THRESHOLD
                # - fast increase and then several values bigger than this point)
                beg_found = True
                smile_beg_frame = diffs_in_time[i]['frame']

            elif beg_found is True and end_found is False and (END_SMILE_THRESHOLD * -1) < diff < \
                    END_SMILE_THRESHOLD and (i+1) > biggest_diff_frame:
                # end of the smile found
                # (between the current lips corners location and the lips corners location in the first frame
                # close to 0 - return to the position at the beginning of the video and frame after the top of
                # the chart)
                end_found = True
                smile_end_frame = diffs_in_time[i+1]['frame']
                break

    except IndexError:
        print(f'\nError:\tNo smile beginning found in "{video_name}."\n')
        smile_beg_frame = 0

    if beg_found is False:
        print(f'\nError:\tNo smile beginning found in "{video_name}."\n')
        smile_beg_frame = 0
    if end_found is False:
        smile_end_frame = num_frames - 1  # last frame of the video

    num_smiles_frames = smile_end_frame - smile_beg_frame + 1

    if num_smiles_frames / num_frames < SMILE_DURATION_MIN_RATIO:  # SMILE_DURATION_MIN_RATIO - minimal
        # <number_of_smile_frames>/<number_of_all_frames> ratio - If less than that take from the beginning
        # till the end
        smile_end_frame = num_frames - 1
        num_smiles_frames = smile_end_frame - smile_beg_frame + 1

    smile_data = {
        'video_name': video_name,
        'num_frames': num_frames,
        'smile_beg_frame': smile_beg_frame,
        'smile_end_frame': smile_end_frame,
        'num_smiles_frames': num_smiles_frames
    }

    smiles_data = {
        "smile_config": {
            "BEG_SMILE_THRESHOLD": BEG_SMILE_THRESHOLD,
            "END_SMILE_THRESHOLD": END_SMILE_THRESHOLD,
            "NUM_FRAMES_RISE_SMILE_BEG": NUM_FRAMES_RISE_SMILE_BEG,
            "MIN_DIFF_IN_RISE_SMILE_BEG": MIN_DIFF_IN_RISE_SMILE_BEG,
            "SMILE_DURATION_MIN_RATIO": SMILE_DURATION_MIN_RATIO
        },
    }
    smiles_data.update(smile_data)
    with open(os.path.abspath(os.path.abspath(os.path.join(os.sep, TMP_DIR, str(id),'smiles_data.json'))), 'w') as f:
        json.dump(smiles_data, f, indent=4)

