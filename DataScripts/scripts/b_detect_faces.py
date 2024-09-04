import os
import cv2
import dlib
import traceback
import threading
import concurrent.futures
from cv2.typing import MatLike
from DataScripts.utils import get_all_filenames
from DataScripts.FaceAligner import FaceAligner
from DataScripts.config import FACES_FEATURES_DET_FP, TMP_DIR
from DataScripts.exceptions import MoreThanOneFaceException, NoFaceException


# Thread-local storage for shared objects
thread_local = threading.local()


def init_thread():
    """Init thread for multithreading purposes."""
    if not hasattr(thread_local, "fa"):
        predictor = dlib.shape_predictor(FACES_FEATURES_DET_FP)
        thread_local.fa = FaceAligner(predictor)
        thread_local.detector = dlib.get_frontal_face_detector()


def get_face_aligner() -> FaceAligner:
    """Get face aligner for multithreading purposes.

    :return: shared face aligner
    :rtype: FaceAligner
    """
    init_thread()
    return thread_local.fa


def get_detector() -> dlib.fhog_object_detector:
    """Get detectore for multithreading purposes.

    :return: shared detector
    :rtype: dlib.fhog_object_detector
    """
    init_thread()
    return thread_local.detector


def save_face(face: MatLike, face_name: str) -> None:
    """Saves a face to a file

    :param face: image of a face
    :type face: MatLike
    :param face_name: name of the file to save
    :type face_name: str
    """
    try:
        cv2.imwrite(face_name, face)
    except Exception as e:
        print(f"Error saving face {face_name}: {e}")
        raise


def process_frame(frame_name: str, frames_dir: str, faces_dir: str) -> str | None:
    """Process one frame of the video - detect face.

    :param frame_name: name of the frame to process
    :type frame_name: str
    :param frames_dir: frames directory
    :type frames_dir: str
    :param faces_dir: faces directory
    :type faces_dir: str
    :raises ValueError: _description_
    :raises MoreThanOneFaceException: detected more than one face
    :raises NoFaceException: no face was detected
    :return: may return an error message or None
    :rtype: str
    """
    try:
        fa = get_face_aligner()
        detector = get_detector()

        frame_path = os.path.join(frames_dir, frame_name)
        img = cv2.imread(frame_path)

        if img is None:
            raise ValueError(f"Image {frame_path} could not be loaded.")

        _gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _faces = detector(_gray)

        if len(_faces) > 1:
            raise MoreThanOneFaceException(
                f"More than one face detected in {frame_name}."
            )
        if len(_faces) == 0:
            raise NoFaceException(f"No face detected in {frame_name}.")
        aligned_face: MatLike = fa.align(img, _gray, _faces[0])
        save_face(aligned_face, os.path.join(faces_dir, frame_name))
    except Exception as e:
        error_msg = f"Exception in processing frame {frame_name}: {str(e)}"
        traceback.print_exc()
        return error_msg
    return None


def detect_faces(id: int, video_name: str) -> None:
    """Detect faces on the video.

    :param id: video ID
    :type id: int
    :param video_name: video name
    :type video_name: str
    """
    faces_dir = os.path.join(TMP_DIR, str(id), "faces")
    frames_dir = os.path.join(TMP_DIR, str(id), "frames")
    frames_names = get_all_filenames(frames_dir)

    print(f"**********************************************\n{video_name}\n")

    if not os.path.exists(faces_dir):
        os.makedirs(faces_dir)

    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = {
            executor.submit(
                process_frame, frame_name, frames_dir, faces_dir
            ): frame_name
            for frame_name in frames_names
        }
        for future in concurrent.futures.as_completed(futures):
            frame_name = futures[future]
            error = future.result()
            if error:
                print(f"Frame {frame_name} generated an exception: {error}")
