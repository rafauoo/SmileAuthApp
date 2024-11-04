import os
import cv2
from DataScripts.config import (
    BEG_SMILE_THRESHOLD,
    END_SMILE_THRESHOLD,
    NUM_FRAMES_RISE_SMILE_BEG,
    MIN_DIFF_IN_RISE_SMILE_BEG,
    SMILE_DURATION_MIN_RATIO,
)
import hashlib
from DataScripts.config import (
    FACES_FEATURES_DET_FP,
    LIPS_CORNER1_IDX,
    LIPS_CORNER2_IDX,
)
from DataScripts.config import (
    NUM_FACES_FEATURES,
    DESIRED_FACE_PHOTO_WIDTH,
    NOSE_TOP_IDX,
)
import dlib
import pandas as pd
import time
from DataScripts.exceptions import NoFaceException, MoreThanOneFaceException
from DataScripts.FaceAligner import FaceAligner
import numpy as np
import av
from DataScripts.process.video_rotation import detect_rotation
import io

"""
This is an old flow file - not including lazy evaluation (yield). It is slower.
"""


def create_unique_tmp_dir(base_dir="/tmp", salt="random_salt"):
    timestamp = int(time.time())
    unique_str = f"{timestamp}_{salt}"
    unique_hash = hashlib.md5(unique_str.encode()).hexdigest()
    tmp_dir_path = os.path.join(base_dir, unique_hash)
    os.makedirs(tmp_dir_path, exist_ok=True)
    return tmp_dir_path


"""
EXPORT FRAMES FROM VIDEO
"""


def export_frames_from_video(video_bytes):
    container = av.open(io.BytesIO(video_bytes))
    frames = []
    rotation = 0
    try:
        rotation = detect_rotation(video_bytes)
    except ValueError:
        roration = 0
    for frame in container.decode(video=0):
        img = frame.to_ndarray(format="bgr24")
        if rotation != 0:
            if rotation == 2:
                img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
            elif rotation == 1:
                img = cv2.rotate(img, cv2.ROTATE_180)
            elif rotation == 3:
                img = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)

        frames.append(img)
    return frames


"""
DETECT FACES ON FRAMES
"""
# thread_local = threading.local()

# def init_thread():
#     if not hasattr(thread_local, 'fa'):
#         predictor = dlib.shape_predictor(FACES_FEATURES_DET_FP)
#         thread_local.fa = FaceAligner(predictor)
#         thread_local.detector = dlib.get_frontal_face_detector()

# def process_frames_batch(frames_batch, results_queue):
#     init_thread()
#     for frame_number, frame in frames_batch:
#         _gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
#         _faces = thread_local.detector(_gray)
#         try:
#             if len(_faces) > 1:
#                 raise MoreThanOneFaceException(f"More than one face detected in #{frame_number}.")
#             if len(_faces) == 0:
#                 raise NoFaceException(f"No face detected in #{frame_number}.")

#             aligned_face = thread_local.fa.align(frame, _gray, _faces[0])
#             results_queue.put((frame_number, aligned_face))
#         except (MoreThanOneFaceException, NoFaceException) as e:
#             results_queue.put((frame_number, e))

# def detect_faces_on_frames(frames, batch_size=20):
#     faces = [None] * len(frames)
#     results_queue = Queue()
#     with ThreadPoolExecutor() as executor:
#         for start in range(0, len(frames), batch_size):
#             end = min(start + batch_size, len(frames))
#             batch = list(enumerate(frames[start:end], start))
#             executor.submit(process_frames_batch, batch, results_queue)
#         for _ in range(len(frames)):
#             frame_number, result = results_queue.get()
#             if isinstance(result, Exception):
#                 print(result)
#             else:
#                 faces[frame_number] = result
#     return faces


def detect_faces_on_frames(frames):
    detector = dlib.get_frontal_face_detector()
    predictor = dlib.shape_predictor(FACES_FEATURES_DET_FP)
    fa = FaceAligner(predictor)
    faces = []
    for num, frame in enumerate(frames):
        try:
            _gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            _faces = detector(_gray)

            if len(_faces) > 1:
                # print(num, frame, _faces)
                raise MoreThanOneFaceException(
                    f"More than one face detected in #{num}.", ""
                )
            if len(_faces) == 0:
                raise NoFaceException(f"No face detected in #{num}.", "")

            aligned_face = fa.align(frame, _gray, _faces[0])
            faces.append(aligned_face)
        except (MoreThanOneFaceException, NoFaceException) as e:
            print(e)  # Handle or log exceptions as needed
            faces.append(
                None
            )  # Append None or some default value in case of an error

    return faces


"""
DETECT SMILES ON FACES
"""
import matplotlib.pyplot as plt


def show_smile_plot(data):
    frames = [d["frame"] for d in data]
    diffs = [d["diff"] for d in data]

    plt.figure(figsize=(18, 5))
    plt.plot(frames, diffs, "-o")

    plt.title(
        "Zmiany odległości kącików ust od wartości początkowej w kolejnych klatkach"
    )
    plt.xlabel("numer klatki")
    plt.ylabel("zmiana odległości kącików ust")
    plt.rcParams["figure.figsize"] = (200, 3)

    plt.show()


def detect_smiles(faces):
    detector = dlib.get_frontal_face_detector()
    predictor = dlib.shape_predictor(FACES_FEATURES_DET_FP)
    diffs_in_time = []
    first_dist = None
    for num, face in enumerate(faces):
        if face is None:
            continue
        gray = cv2.cvtColor(src=face, code=cv2.COLOR_BGR2GRAY)
        faces_detected = detector(gray)
        if len(faces_detected) == 0:
            continue
        face_gray = faces_detected[0]

        _landmarks = predictor(image=gray, box=face_gray)

        x1 = _landmarks.part(LIPS_CORNER1_IDX).x
        y1 = _landmarks.part(LIPS_CORNER1_IDX).y

        x2 = _landmarks.part(LIPS_CORNER2_IDX).x
        y2 = _landmarks.part(LIPS_CORNER2_IDX).y

        dY = y2 - y1
        dX = x2 - x1
        dist = np.sqrt((dX**2) + (dY**2))

        if first_dist is None:
            first_dist = dist

        curr_diff = abs(dist - first_dist)

        diffs_in_time.append({"frame": num, "diff": curr_diff})
    # finding top of the chart (to be able to find the end of the smile - It has to be after the top of
    # the chart.)
    filtered_diffs = [
        _dict for _dict in diffs_in_time if _dict["diff"] is not None
    ]
    sorted_diffs = sorted(filtered_diffs, key=lambda d: d["diff"])
    biggest_diff_frame = sorted_diffs[-1]["frame"]

    # finding beginning and end of the smile
    beg_found, end_found = False, False
    smile_beg_frame, smile_end_frame, num_smiles_frames = None, None, None
    num_frames = len(faces)

    try:
        for i in range(
            1, len(diffs_in_time) - 1
        ):  # From 1 because first value is always None.
            dY = (
                diffs_in_time[i + 1]["diff"] - diffs_in_time[i]["diff"]
            )  # dX = 1 (frames difference)
            diff = diffs_in_time[i + 1]["diff"]

            rise_diffs = []
            if beg_found is False:
                for x in range(1, NUM_FRAMES_RISE_SMILE_BEG + 1):
                    # IndexError can happen here:
                    rise_diffs.append(diffs_in_time[i + x]["diff"])

            if (
                beg_found is False
                and dY > BEG_SMILE_THRESHOLD
                and all(
                    rise_diff
                    > (diffs_in_time[i]["diff"] + MIN_DIFF_IN_RISE_SMILE_BEG)
                    for rise_diff in rise_diffs
                )
            ):
                # beginning of the smile found (slope of the line (differences between the current lips corners
                # location and the lips corners location in the first frame) > BEG_SMILE_THRESHOLD
                # - fast increase and then several values bigger than this point)
                print(i, rise_diffs)
                beg_found = True
                smile_beg_frame = diffs_in_time[i]["frame"]

            elif (
                beg_found is True
                and end_found is False
                and (END_SMILE_THRESHOLD * -1) < diff < END_SMILE_THRESHOLD
                and (i + 1) > biggest_diff_frame
            ):
                # end of the smile found
                # (between the current lips corners location and the lips corners location in the first frame
                # close to 0 - return to the position at the beginning of the video and frame after the top of
                # the chart)
                end_found = True
                smile_end_frame = diffs_in_time[i + 1]["frame"]
                break

    except IndexError:
        print(f"\nError:\tNo smile beginning found")
        smile_beg_frame = 0

    if beg_found is False:
        print(f"\nError:\tNo smile beginning found")
        smile_beg_frame = 0
    if end_found is False:
        smile_end_frame = num_frames - 1  # last frame of the video

    num_smiles_frames = smile_end_frame - smile_beg_frame + 1

    if (
        num_smiles_frames / num_frames < SMILE_DURATION_MIN_RATIO
    ):  # SMILE_DURATION_MIN_RATIO - minimal
        # <number_of_smile_frames>/<number_of_all_frames> ratio - If less than that take from the beginning
        # till the end
        smile_end_frame = num_frames - 1
        num_smiles_frames = smile_end_frame - smile_beg_frame + 1

    smile_data = {
        "num_frames": num_frames,
        "smile_beg_frame": smile_beg_frame,
        "smile_end_frame": smile_end_frame,
        "num_smiles_frames": num_smiles_frames,
    }
    # print(smile_data)
    # show_smile_plot(diffs_in_time)
    return smile_data


"""
CROP SMILES
"""


def get_first_39_smile_frames(smile_beg_frame, num_smiles_frames):

    if num_smiles_frames >= 39:
        smile_start = smile_beg_frame
        smile_end = smile_beg_frame + 38
        return range(smile_start, smile_end + 1)
    else:
        raise ValueError("Not enough smile frames")


def get_selected_ids(smile_data):
    beg_frame = smile_data["smile_beg_frame"]
    num_frames = smile_data["num_smiles_frames"]
    return get_first_39_smile_frames(beg_frame, num_frames)


"""
GENERATE ANGLES DATA
"""
f1 = lambda num: f"{num}x"
f2 = lambda num: f"{num}y"
header = ["frame_number"] + [
    f(i) for i in range(NUM_FACES_FEATURES) for f in (f1, f2)
]


def save_landmarks_row(writer, landmarks, frame_number):
    x = lambda n: landmarks.part(n).x
    y = lambda n: landmarks.part(n).y
    row = [frame_number] + [
        f(i) for i in range(NUM_FACES_FEATURES) for f in (x, y)
    ]
    writer.writerow(row)


def calculate_dx_dy(
    left_lips_corner_x,
    left_lips_corner_y,
    right_lips_corner_x,
    right_lips_corner_y,
    nose_top_x,
    nose_top_y,
):
    lc_dx = left_lips_corner_x - nose_top_x
    lc_dy = left_lips_corner_y - nose_top_y

    rc_dx = right_lips_corner_x - nose_top_x
    rc_dy = right_lips_corner_y - nose_top_y

    return lc_dx, lc_dy, rc_dx, rc_dy


import csv


def create_ff_data_file_writer(filepath):
    file = open(filepath, "w", newline="")
    writer = csv.writer(file, delimiter=";")
    writer.writerow(header)
    return file, writer


def unit_vector(vector):
    return vector / np.linalg.norm(vector)


def angle_between(v1, v2):
    v1_u = unit_vector(v1)
    v2_u = unit_vector(v2)
    return np.arccos(np.clip(np.dot(v1_u, v2_u), -1.0, 1.0))


def prepare_angle_data(data):
    left_lips_corner_x = data[f"{LIPS_CORNER1_IDX}x"]
    left_lips_corner_y = (
        DESIRED_FACE_PHOTO_WIDTH - data[f"{LIPS_CORNER1_IDX}y"]
    )

    right_lips_corner_x = data[f"{LIPS_CORNER2_IDX}x"]
    right_lips_corner_y = (
        DESIRED_FACE_PHOTO_WIDTH - data[f"{LIPS_CORNER2_IDX}y"]
    )

    nose_top_x = data[f"{NOSE_TOP_IDX}x"]
    nose_top_y = DESIRED_FACE_PHOTO_WIDTH - data[f"{NOSE_TOP_IDX}y"]
    angles = []
    lc_dx, lc_dy, rc_dx, rc_dy = calculate_dx_dy(
        left_lips_corner_x,
        left_lips_corner_y,
        right_lips_corner_x,
        right_lips_corner_y,
        nose_top_x,
        nose_top_y,
    )
    for i in range(len(lc_dx)):
        v1 = lc_dx.iloc[i], lc_dy.iloc[i]
        v2 = rc_dx.iloc[i], rc_dy.iloc[i]
        angles.append(angle_between(v1, v2))
    angles = list(map(lambda el: el / angles[0], angles))
    return pd.DataFrame(angles, columns=["lips_corners_from_nose_angle"])


def generate_data(faces):
    detector = dlib.get_frontal_face_detector()
    predictor = dlib.shape_predictor(FACES_FEATURES_DET_FP)

    all_landmarks = []

    for num, face in enumerate(faces):
        if face is None:
            continue
        gray = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
        faces_detected = detector(gray)
        if len(faces_detected) == 0:
            continue
        face_box = faces_detected[0]
        landmarks = predictor(gray, face_box)

        x = lambda n: landmarks.part(n).x
        y = lambda n: landmarks.part(n).y

        row = [num] + [f(i) for i in range(NUM_FACES_FEATURES) for f in (x, y)]
        all_landmarks.append(row)

    f1 = lambda num: f"{num}x"
    f2 = lambda num: f"{num}y"
    header = ["frame_number"] + [
        f(i) for i in range(NUM_FACES_FEATURES) for f in (f1, f2)
    ]
    data = pd.DataFrame(all_landmarks, columns=header)
    # Prepare angle data
    selected_data_x = prepare_angle_data(data)

    return selected_data_x


"""
SAVE DATA TO CSV
"""


def flow(video_bytes: bytes) -> pd.DataFrame:
    """Entry point for processing video to retrieve angle data from it.

    :param video_bytes: bytes of the video
    :type video_bytes: bytes
    :raises SmileNotDetectedException: smile was not detected or was too short
    :return: angles data
    :rtype: pd.DataFrame
    """
    frames = export_frames_from_video(video_bytes)
    faces = detect_faces_on_frames(frames)
    smile_data = detect_smiles(faces)
    ids = get_selected_ids(smile_data)
    faces = [face for num, face in enumerate(faces) if num in ids]
    angles = generate_data(faces)
    return angles
