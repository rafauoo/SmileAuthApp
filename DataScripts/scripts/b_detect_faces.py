import os
from config import TMP_DIR
from scripts.FaceAligner import FaceAligner
import dlib
import concurrent.futures
import cv2
from utils import get_all_filenames
from config import FACES_FEATURES_DET_FP
from exceptions import MoreThanOneFaceException, NoFaceException

def save_face(face, face_name):
    cv2.imwrite(face_name, face)

def process_frame(frame_name, frames_dir, faces_dir, fa, detector):
    try:
        frame_path = os.path.join(frames_dir, frame_name)
        img = cv2.imread(frame_path)
        _gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _faces = detector(_gray)
        if len(_faces) > 1:
            raise MoreThanOneFaceException
        if len(_faces) == 0:
            raise NoFaceException
        print("DO")
        aligned_face = fa.align(img, _gray, _faces[0])
        save_face(aligned_face, os.path.join(faces_dir, frame_name))
    except Exception as e:
        return str(e)
    return None

def detect_faces(id, video_name):
    predictor = dlib.shape_predictor(FACES_FEATURES_DET_FP)
    fa = FaceAligner(predictor)
    detector = dlib.get_frontal_face_detector()

    faces_dir = os.path.join(TMP_DIR, str(id), "faces")
    frames_dir = os.path.join(TMP_DIR, str(id), "frames")
    frames_names = get_all_filenames(frames_dir)

    print(f'**********************************************\n{video_name}\n')

    if not os.path.exists(faces_dir):
        os.makedirs(faces_dir)

    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = {
            executor.submit(process_frame, frame_name, frames_dir, faces_dir, fa, detector): frame_name
            for frame_name in frames_names
        }
        for future in concurrent.futures.as_completed(futures):
            frame_name = futures[future]
            error = future.result()
            if error:
                print(f'Frame {frame_name} generated an exception: {error}')