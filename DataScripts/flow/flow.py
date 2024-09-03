import cv2
import dlib
import io
import av
import collections
from dotmap import DotMap
import pandas as pd
import numpy as np
from typing import Generator
from cv2.typing import MatLike
from DataScripts.config import (
    FACES_FEATURES_DET_FP,
    LIPS_CORNER1_IDX,
    LIPS_CORNER2_IDX,
    BEG_SMILE_THRESHOLD,
    NUM_FRAMES_RISE_SMILE_BEG,
    NUM_FACES_FEATURES,
    DESIRED_FACE_PHOTO_WIDTH,
    MIN_DIFF_IN_RISE_SMILE_BEG,
    NOSE_TOP_IDX,
    CURRENT_MIN_NUM_SMILE_FRAMES,
)
from DataScripts.FaceAligner import FaceAligner
from DataScripts.flow.video_rotation import detect_rotation, VideoRotation
from DataScripts.exceptions import NoFaceException, MoreThanOneFaceException, SmileNotDetectedException


def frames_from_video(video_bytes: bytes) -> Generator[MatLike, None, None]:
    """Generator yielding video frames. It exports frames from video.

    :param video_bytes: bytes of the video
    :type video_bytes: bytes
    :return: generator of video frames
    :rtype: Generator[MatLike, None, None]

    """
    container = av.open(io.BytesIO(video_bytes))
    rotation = detect_rotation(video_bytes)
    for frame in container.decode(video=0):
        img = frame.to_ndarray(format="bgr24")
        match rotation:
            case VideoRotation.ROTATED_180:
                img = cv2.rotate(img, cv2.ROTATE_180)
            case VideoRotation.ROTATED_90_CW:
                img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
            case VideoRotation.ROTATED_90_CCW:
                img = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)
        yield img


def faces_landmarks(
    video_bytes: bytes,
) -> Generator[dlib.full_object_detection, None, None]:
    """Generator yielding face landmarks.

    :param video_bytes: bytes of the video
    :type video_bytes: bytes
    :return: generator of face landmarks
    :rtype: Generator[dlib.full_object_detection, None, None]

    dlib.full_object_detection - landmarks

    In case of any error skips the frame.
    Errors than can occur inside of the generator:

        MoreThanOneFaceException - more than one face was detected in frame

        NoFaceException - no face was detected in frame
    """
    detector = dlib.get_frontal_face_detector()
    predictor = dlib.shape_predictor(FACES_FEATURES_DET_FP)
    last_face = None
    fa = FaceAligner(predictor)
    for num, frame in enumerate(frames_from_video(video_bytes)):
        try:
            _gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            _faces: list = detector(_gray)
            # Checking whether there is exaclty one face detected
            if len(_faces) > 1:
                raise MoreThanOneFaceException(
                    f"More than one face detected in #{num}.", ""
                )
            if len(_faces) == 0:
                raise NoFaceException(f"No face detected in #{num}.", "")

            # aligning the face
            aligned_face = fa.align(frame, _gray, _faces[0])
            gray = cv2.cvtColor(src=aligned_face, code=cv2.COLOR_BGR2GRAY)
            faces_detected: list = detector(gray)
            # Sometimes face is not detected on an aligned image.
            # When that happens last known face coordinates can be used
            # since face was detected on a not-aligned image.
            if len(faces_detected) == 0:
                if last_face is None:
                    continue
                _landmarks = predictor(image=gray, box=last_face)
            else:
                _landmarks = predictor(image=gray, box=faces_detected[0])
                last_face = faces_detected[0]
            yield _landmarks
        except (MoreThanOneFaceException, NoFaceException) as e:
            print(e)
            continue


def mouth_edges_distances(
    video_bytes: bytes,
) -> Generator[any, None, None]:
    """Generator yielding landmarks and mouth edges distances of a face.

    :param video_bytes: bytes of the video
    :type video_bytes: bytes
    :return: generator of (landmarks, distances) of faces
    :rtype: Generator[(dlib.full_object_detection, np.float64), None, None]

    (dlib.full_object_detection, np.float64) - pair of (landmarks, distance)
    """
    for landmarks in faces_landmarks(video_bytes):
        x1 = landmarks.part(LIPS_CORNER1_IDX).x
        y1 = landmarks.part(LIPS_CORNER1_IDX).y
        x2 = landmarks.part(LIPS_CORNER2_IDX).x
        y2 = landmarks.part(LIPS_CORNER2_IDX).y
        dY = y2 - y1
        dX = x2 - x1
        dist = np.sqrt((dX**2) + (dY**2))
        yield landmarks, dist


def smile_data_from_beg_to_end(
    video_bytes,
) -> Generator[dlib.full_object_detection, None, None]:
    """Generator yielding landmarks of found smile frames.

    :param video_bytes: bytes of the video
    :type video_bytes: bytes
    :return: generator of landmarks of found smile frames
    :rtype: Generator[dlib.full_object_detection, None, None]

    dlib.full_object_detection - landmarks
    """
    first_dist = last_diff = curr_diff = curr_data = None
    beg_found = False
    first_beg = True
    counter = CURRENT_MIN_NUM_SMILE_FRAMES
    dist_deque = collections.deque(maxlen=NUM_FRAMES_RISE_SMILE_BEG)
    for i, (landmarks, dist) in enumerate(mouth_edges_distances(video_bytes)):
        if first_dist == None:
            first_dist = dist  # set first distance
        last_diff = curr_diff
        curr_diff = abs(dist - first_dist)
        if i > 1:  # if it is at least 2nd dist
            i = i - 1
            dY = curr_diff - last_diff
            dist_deque.append(DotMap(curr_diff=curr_diff, landmarks=landmarks, dY=dY))
            if not beg_found:
                if not len(dist_deque) == dist_deque.maxlen:
                    continue  # waiting for collecting 20 values
                last_data = curr_data
                curr_data = (
                    dist_deque.popleft()
                )  # get (curr_diff, landmarks, dY) of the oldest value
                if last_data is None:
                    continue  # if it is the first data in video
                # Checking whether next 20 frames have wider smiles than the last one.
                if (
                    curr_data.dY > BEG_SMILE_THRESHOLD
                    and curr_data.curr_diff
                    > last_data.curr_diff + MIN_DIFF_IN_RISE_SMILE_BEG
                ):
                    for landmark_dY in dist_deque:
                        if (
                            landmark_dY.curr_diff
                            <= last_data.curr_diff + MIN_DIFF_IN_RISE_SMILE_BEG
                        ):
                            break
                    else:
                        beg_found = True
                        yield last_data.landmarks  # yielding last data as beginning of the smile
                    # if all distances in deque are bigger than curr dY + min_diff then beg is found
            if beg_found:
                if not first_beg:
                    curr_data = dist_deque.popleft()
                first_beg = False
                yield curr_data.landmarks  # yielding next CURRENT_MIN_NUM_SMILE_FRAMES - 1 frames
                counter -= 1
                if counter == 1:
                    break


def angle_between(v1: tuple, v2: tuple) -> np.ndarray:
    """Calculates angle between two vectors

    :param v1: vector1
    :type v1: tuple
    :param v2: vector2
    :type v2: tuple
    :return: arccos of an angle between two vectors
    :rtype: np.ndarray
    """
    v1_u = v1 / np.linalg.norm(v1)
    v2_u = v2 / np.linalg.norm(v2)
    return np.arccos(np.clip(np.dot(v1_u, v2_u), -1.0, 1.0))


def prepare_angle_data(data: pd.DataFrame) -> pd.DataFrame:
    """Prepares DataFrame with angle data for a video

    :param data: faces landmarks data
    :type data: pd.DataFrame
    :return: angles data
    :rtype: pd.DataFrame
    """
    left_lips_corner_x = data[f"{LIPS_CORNER1_IDX}x"]
    left_lips_corner_y = DESIRED_FACE_PHOTO_WIDTH - data[f"{LIPS_CORNER1_IDX}y"]

    right_lips_corner_x = data[f"{LIPS_CORNER2_IDX}x"]
    right_lips_corner_y = DESIRED_FACE_PHOTO_WIDTH - data[f"{LIPS_CORNER2_IDX}y"]

    nose_top_x = data[f"{NOSE_TOP_IDX}x"]
    nose_top_y = DESIRED_FACE_PHOTO_WIDTH - data[f"{NOSE_TOP_IDX}y"]
    angles = []

    lc_dx = left_lips_corner_x - nose_top_x
    lc_dy = left_lips_corner_y - nose_top_y

    rc_dx = right_lips_corner_x - nose_top_x
    rc_dy = right_lips_corner_y - nose_top_y

    for i in range(len(lc_dx)):
        v1 = lc_dx.iloc[i], lc_dy.iloc[i]
        v2 = rc_dx.iloc[i], rc_dy.iloc[i]
        angles.append(angle_between(v1, v2))
    angles = list(map(lambda el: el / angles[0], angles))
    return pd.DataFrame(angles, columns=["lips_corners_from_nose_angle"])


def generate_data(video_bytes: bytes) -> pd.DataFrame:
    """Prepares smiles data for a video

    :param video_bytes: bytes of the video
    :type video_bytes: bytes
    :raises SmileNotDetectedException: smile was not detected or was too short
    :return: smile angles data
    :rtype: pd.DataFrame
    """
    all_landmarks = []
    for num, landmarks in enumerate(smile_data_from_beg_to_end(video_bytes)):
        x = lambda n: landmarks.part(n).x
        y = lambda n: landmarks.part(n).y
        row = [num] + [f(i) for i in range(NUM_FACES_FEATURES) for f in (x, y)]
        all_landmarks.append(row)
    if len(all_landmarks) < CURRENT_MIN_NUM_SMILE_FRAMES:
        raise SmileNotDetectedException("Smile was not detected.", "")
    f1 = lambda num: f"{num}x"
    f2 = lambda num: f"{num}y"
    header = ["frame_number"] + [
        f(i) for i in range(NUM_FACES_FEATURES) for f in (f1, f2)
    ]
    data = pd.DataFrame(all_landmarks, columns=header)
    return prepare_angle_data(data)


def flow(video_bytes: bytes) -> pd.DataFrame:
    """Main function of the module - entry point.

    :param video_bytes: bytes of the video
    :type video_bytes: bytes
    :raises SmileNotDetectedException: smile was not detected or was too short
    :return: angles data
    :rtype: pd.DataFrame
    """
    angles = generate_data(video_bytes)
    return angles
