import os
import threading
from DataScripts.config import TMP_DIR
from scripts.FaceAligner import FaceAligner
import dlib
import concurrent.futures
import cv2
from DataScripts.utils import get_all_filenames
from DataScripts.config import FACES_FEATURES_DET_FP
from exceptions import MoreThanOneFaceException, NoFaceException
import traceback

# Thread-local storage for shared objects
thread_local = threading.local()

def init_thread():
    if not hasattr(thread_local, 'fa'):
        predictor = dlib.shape_predictor(FACES_FEATURES_DET_FP)
        thread_local.fa = FaceAligner(predictor)
        thread_local.detector = dlib.get_frontal_face_detector()

def get_face_aligner():
    init_thread()
    return thread_local.fa

def get_detector():
    init_thread()
    return thread_local.detector

def save_face(face, face_name):
    try:
        cv2.imwrite(face_name, face)
    except Exception as e:
        print(f"Error saving face {face_name}: {e}")
        raise

def process_frame(frame_name, frames_dir, faces_dir):
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
            raise MoreThanOneFaceException(f"More than one face detected in {frame_name}.")
        if len(_faces) == 0:
            raise NoFaceException(f"No face detected in {frame_name}.")
        aligned_face = fa.align(img, _gray, _faces[0])
        save_face(aligned_face, os.path.join(faces_dir, frame_name))
    except Exception as e:
        error_msg = f"Exception in processing frame {frame_name}: {str(e)}"
        traceback.print_exc()
        return error_msg
    return None

def detect_faces(id, video_name):
    faces_dir = os.path.join(TMP_DIR, str(id), "faces")
    frames_dir = os.path.join(TMP_DIR, str(id), "frames")
    frames_names = get_all_filenames(frames_dir)

    print(f'**********************************************\n{video_name}\n')

    if not os.path.exists(faces_dir):
        os.makedirs(faces_dir)

    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = {
            executor.submit(process_frame, frame_name, frames_dir, faces_dir): frame_name
            for frame_name in frames_names
        }
        for future in concurrent.futures.as_completed(futures):
            frame_name = futures[future]
            error = future.result()
            if error:
                print(f'Frame {frame_name} generated an exception: {error}')
