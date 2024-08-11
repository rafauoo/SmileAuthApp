import os
import sys
import cv2
import dlib
import pandas as pd
import csv
import numpy as np

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from config import FACES_FEATURES_DET_FP, TMP_DIR, NUM_FACES_FEATURES, LIPS_CORNER1_IDX, LIPS_CORNER2_IDX, \
    DESIRED_FACE_PHOTO_WIDTH, NOSE_TOP_IDX
from utils import get_filenames_sorted_by_frame_num, get_frame_num

f1 = lambda num: f'{num}x'
f2 = lambda num: f'{num}y'
header = ['frame_number'] + [f(i) for i in range(NUM_FACES_FEATURES) for f in (f1, f2)]


def calculate_dx_dy(left_lips_corner_x, left_lips_corner_y, right_lips_corner_x, right_lips_corner_y, nose_top_x,
                    nose_top_y):
    lc_dx = left_lips_corner_x - nose_top_x
    lc_dy = left_lips_corner_y - nose_top_y

    rc_dx = right_lips_corner_x - nose_top_x
    rc_dy = right_lips_corner_y - nose_top_y

    return lc_dx, lc_dy, rc_dx, rc_dy

def unit_vector(vector):
    return vector / np.linalg.norm(vector)

def angle_between(v1, v2):
    v1_u = unit_vector(v1)
    v2_u = unit_vector(v2)
    return np.arccos(np.clip(np.dot(v1_u, v2_u), -1.0, 1.0))

def create_ff_data_file_writer(filepath):
    file = open(filepath, 'w', newline='')
    writer = csv.writer(file, delimiter=';')
    writer.writerow(header)
    return file, writer

def save_landmarks_row(writer, landmarks, frame_number):
    x = lambda n: landmarks.part(n).x
    y = lambda n: landmarks.part(n).y
    row = [frame_number] + [f(i) for i in range(NUM_FACES_FEATURES) for f in (x, y)]
    writer.writerow(row)

def prepare_angle_data(data):
    left_lips_corner_x = data[f'{LIPS_CORNER1_IDX}x']
    left_lips_corner_y = DESIRED_FACE_PHOTO_WIDTH - data[f'{LIPS_CORNER1_IDX}y']

    right_lips_corner_x = data[f'{LIPS_CORNER2_IDX}x']
    right_lips_corner_y = DESIRED_FACE_PHOTO_WIDTH - data[f'{LIPS_CORNER2_IDX}y']

    nose_top_x = data[f'{NOSE_TOP_IDX}x']
    nose_top_y = DESIRED_FACE_PHOTO_WIDTH - data[f'{NOSE_TOP_IDX}y']
    angles = []
    lc_dx, lc_dy, rc_dx, rc_dy = calculate_dx_dy(left_lips_corner_x, left_lips_corner_y,
                                                    right_lips_corner_x, right_lips_corner_y, nose_top_x,
                                                    nose_top_y)
    for i in range(len(lc_dx)):
        v1 = lc_dx.iloc[i], lc_dy.iloc[i]
        v2 = rc_dx.iloc[i], rc_dy.iloc[i]
        angles.append(angle_between(v1, v2))
    angles = list(map(lambda el: el/angles[0], angles))
    return pd.DataFrame(angles, columns=['lips_corners_from_nose_angle'])

def smiles_to_csv(id, video_name):
    detector = dlib.get_frontal_face_detector()
    predictor = dlib.shape_predictor(FACES_FEATURES_DET_FP)

    smiles_dir = os.path.abspath(os.path.join(TMP_DIR, str(id), "smiles"))
    faces_names = get_filenames_sorted_by_frame_num(smiles_dir)

    print(f'**********************************************\n{video_name}\n')

    ffd_path = os.path.abspath(os.path.join(os.sep, TMP_DIR, str(id), f'all_data.csv'))
    f, _writer = create_ff_data_file_writer(ffd_path)

    for face_name in faces_names:
        face_path = os.path.abspath(os.path.join(os.sep, smiles_dir, face_name))

        img = cv2.imread(face_path)
        gray = cv2.cvtColor(src=img, code=cv2.COLOR_BGR2GRAY)
        _frame_number = get_frame_num(face_name)

        faces = detector(gray)
        for face in faces:
            # save in the data file
            _landmarks = predictor(image=gray, box=face)

            save_landmarks_row(_writer, _landmarks, _frame_number)

    f.close()
    print(f'all_data.csv face features data file created successfully.')
    data = pd.read_csv(ffd_path, delimiter=';')
    selected_data_x = prepare_angle_data(data)
    out_ffd_path = os.path.abspath(os.path.join(os.sep, TMP_DIR, str(id), f'data.csv'))
    selected_data_x.to_csv(out_ffd_path, sep=';', index=False, header=True)
