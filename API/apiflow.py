import os
import sys
import cv2
from DataScripts.config import TMP_DIR, FACES_FEATURES_DET_FP, LIPS_CORNER1_IDX, LIPS_CORNER2_IDX, BEG_SMILE_THRESHOLD, \
    END_SMILE_THRESHOLD, NUM_FRAMES_RISE_SMILE_BEG, \
    MIN_DIFF_IN_RISE_SMILE_BEG, SMILE_DURATION_MIN_RATIO
import hashlib
from DataScripts.config import FACES_FEATURES_DET_FP, LIPS_CORNER1_IDX, LIPS_CORNER2_IDX
from DataScripts.config import FACES_FEATURES_DET_FP, TMP_DIR, NUM_FACES_FEATURES, LIPS_CORNER1_IDX, LIPS_CORNER2_IDX, \
    DESIRED_FACE_PHOTO_WIDTH, NOSE_TOP_IDX, ROOT_DIR, CURRENT_MIN_NUM_SMILE_FRAMES
import random
import dlib
import collections
from dotmap import DotMap
import pandas as pd
import time
import threading
from DataScripts.exceptions import NoFaceException, MoreThanOneFaceException
from DataScripts.flow.FaceAligner import FaceAligner
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from queue import Queue
import imageio.v3 as iio
import av
from API.rotate_mp4 import detect_rotation
import io

"""
EXPORT FRAMES FROM VIDEO
"""
def frames_from_video(video_bytes):
    container = av.open(io.BytesIO(video_bytes))
    rotation = 0
    try:
        rotation = detect_rotation(video_bytes)
    except ValueError:
        roration = 0
    for frame in container.decode(video=0):
        img = frame.to_ndarray(format='bgr24')
        match rotation:
            case 1:
                img = cv2.rotate(img, cv2.ROTATE_180)
            case 2:
                img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
            case 3:
                img = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)
        yield img


"""
DETECT FACES ON FRAMES
"""
def faces_landmarks(video_bytes):
    detector = dlib.get_frontal_face_detector()
    predictor = dlib.shape_predictor(FACES_FEATURES_DET_FP)
    fa = FaceAligner(predictor)
    for num, frame in enumerate(frames_from_video(video_bytes)):
        try:
            _gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            _faces = detector(_gray)
            if len(_faces) > 1:
                raise MoreThanOneFaceException(f"More than one face detected in #{num}.", "")
            if len(_faces) == 0:
                raise NoFaceException(f"No face detected in #{num}.", "")
            
            aligned_face = fa.align(frame, _gray, _faces[0])
            gray = cv2.cvtColor(src=aligned_face, code=cv2.COLOR_BGR2GRAY)
            faces_detected = detector(gray)
            _landmarks = predictor(image=gray, box=faces_detected[0])
            yield _landmarks
        except (MoreThanOneFaceException, NoFaceException) as e:
            print(e)
            continue

def mouth_edges_distances(video_bytes):
    for landmarks in faces_landmarks(video_bytes):
        x1 = landmarks.part(LIPS_CORNER1_IDX).x
        y1 = landmarks.part(LIPS_CORNER1_IDX).y
        x2 = landmarks.part(LIPS_CORNER2_IDX).x
        y2 = landmarks.part(LIPS_CORNER2_IDX).y
        dY = y2 - y1
        dX = x2 - x1
        dist = np.sqrt((dX ** 2) + (dY ** 2))
        yield landmarks, dist

def smile_data_from_beg_to_end(video_bytes):
    first_dist = None
    last_diff = None
    curr_diff = None
    beg_found = False
    first_beg = True
    curr_data = None
    counter = CURRENT_MIN_NUM_SMILE_FRAMES
    dist_deque = collections.deque(maxlen=NUM_FRAMES_RISE_SMILE_BEG)
    for i, (landmarks, dist) in enumerate(mouth_edges_distances(video_bytes)):
        if first_dist == None:
            first_dist = dist # set first distance
        last_diff = curr_diff
        curr_diff = abs(dist - first_dist)
        if i > 1: # if it is at least 2nd dist
            i = i - 1
            dY = curr_diff - last_diff
            dist_deque.append(DotMap(curr_diff=curr_diff, landmarks=landmarks, dY=dY))
            print(i, curr_diff)
            if not beg_found:
                if not len(dist_deque) == dist_deque.maxlen:
                    continue # waiting for collecting 20 values
                last_data = curr_data
                curr_data = dist_deque.popleft() # get (curr_diff, landmarks, dY) of the oldest value
                if last_data is None:
                    continue
                print(last_data, curr_data)
                if curr_data.dY > BEG_SMILE_THRESHOLD and curr_data.curr_diff > last_data.curr_diff + MIN_DIFF_IN_RISE_SMILE_BEG:
                    print(curr_data.curr_diff)
                    for landmark_dY in dist_deque:
                        print(landmark_dY.curr_diff, last_data.curr_diff, MIN_DIFF_IN_RISE_SMILE_BEG)
                        if landmark_dY.curr_diff <= last_data.curr_diff + MIN_DIFF_IN_RISE_SMILE_BEG:
                            print("yes")
                            break
                    else:
                        beg_found = True
                        yield last_data.landmarks
                    # if all distances in deque are bigger than curr dY + min_diff then bef is found
            if beg_found:
                if not first_beg:
                    curr_data = dist_deque.popleft()
                first_beg = False
                yield curr_data.landmarks
                counter -= 1
                if counter == 1:
                    break

#######################
f1 = lambda num: f'{num}x'
f2 = lambda num: f'{num}y'
header = ['frame_number'] + [f(i) for i in range(NUM_FACES_FEATURES) for f in (f1, f2)]
def save_landmarks_row(writer, landmarks, frame_number):
    x = lambda n: landmarks.part(n).x
    y = lambda n: landmarks.part(n).y
    row = [frame_number] + [f(i) for i in range(NUM_FACES_FEATURES) for f in (x, y)]
    writer.writerow(row)

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

def generate_data(video_bytes):
    all_landmarks = []
    for num, landmarks in enumerate(smile_data_from_beg_to_end(video_bytes)):
        x = lambda n: landmarks.part(n).x
        y = lambda n: landmarks.part(n).y
        row = [num] + [f(i) for i in range(NUM_FACES_FEATURES) for f in (x, y)]
        all_landmarks.append(row)
    f1 = lambda num: f'{num}x'
    f2 = lambda num: f'{num}y'
    header = ['frame_number'] + [f(i) for i in range(NUM_FACES_FEATURES) for f in (f1, f2)]
    data = pd.DataFrame(all_landmarks, columns=header)
    # Prepare angle data
    selected_data_x = prepare_angle_data(data)
    
    return selected_data_x

def flow(video_bytes):
    #tmp_dir = create_unique_tmp_dir(TMP_DIR, random.randbytes(10))
    angles = generate_data(video_bytes)
    return angles