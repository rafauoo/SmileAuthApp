import sys
import os
import cv2
import dlib
from DataScripts.config import ROOT_DIR, DATA_SCRIPTS_DIR

FRAMES_DIR =  from_path = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "0", "frames"))
VIDEOS_DIR = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "0", "videos"))
FACES_DIR = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "0", "faces2"))
NEW_FACES_DIR = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "0", "faces"))
FACES_FEATURES_DET_FP = os.path.abspath(
    os.path.join(
        os.sep,
        DATA_SCRIPTS_DIR,
        "face_features",
        "shape_predictor_68_face_landmarks.dat",
    )
)

def get_all_filenames(directory):
    return list(filter(None, [f for f in os.listdir(directory) if
                              os.path.isfile(os.path.join(directory, f)) and f[:2] != '._']))


def get_all_subdirs(directory):
    return list(filter(None, [f for f in os.listdir(directory)]))

from DataScripts.original_scripts.face_aligner import FaceAligner

def get_faces(gray, algorithm):
    faces = None
    detector = dlib.get_frontal_face_detector()
    faces = detector(gray)
    return faces


def save_faces(faces, face_name):
    faces_extracted = 0
    for num, face in enumerate(faces):
        if num != 0:
            cv2.imwrite(f'{face_name}_face{str(num)}.jpg', face)
        else:
            cv2.imwrite(face_name, face)
        faces_extracted += 1
    return faces_extracted


if __name__ == '__main__':

    if not os.path.exists(NEW_FACES_DIR):
        os.makedirs(NEW_FACES_DIR)
    if not os.path.exists(FACES_DIR):
        os.makedirs(FACES_DIR)

    videos_names = get_all_subdirs(FRAMES_DIR)
    done_videos_names = get_all_subdirs(FACES_DIR)
    todo_videos_names = [vn for vn in videos_names if vn not in done_videos_names]
    todo_videos_names = videos_names

    print('all videos: ', len(videos_names))
    print('done videos: ', len(done_videos_names))
    print('videos to do: ', len(todo_videos_names))

    if todo_videos_names:
        predictor = dlib.shape_predictor(FACES_FEATURES_DET_FP)  # to detect features to align faces
        fa = FaceAligner(predictor)

        num_frames, dirs_created, _faces_extracted = 0, 0, 0

        for video_name in todo_videos_names:
            # create dir for the faces
            faces_dir = os.path.abspath(os.path.join(os.sep, NEW_FACES_DIR, video_name))
            frames_dir = os.path.abspath(os.path.join(os.sep, FRAMES_DIR, video_name))
            frames_names = get_all_filenames(frames_dir)
            video_faces_extracted = 0

            if not os.path.exists(faces_dir):
                print(f'**********************************************\n{video_name}\n')

                os.makedirs(faces_dir)
                dirs_created += 1
                num_frames += len(frames_names)

                os.chdir(faces_dir)

                for frame_name in frames_names:
                    frame_path = os.path.abspath(os.path.join(os.sep, frames_dir, frame_name))

                    img = cv2.imread(frame_path)
                    _gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                    _faces = get_faces(img, 2)

                    if _faces is not None:
                        # align and crop faces
                        aligned_faces = [fa.align(img, _gray, _face) for _face in _faces]
                        # save cropped faces
                        fe = save_faces(aligned_faces, frame_name)

                        video_faces_extracted += fe
                        _faces_extracted += fe

            print(f'Number of frames: {len(frames_names)}\nNumber of faces extracted: {video_faces_extracted}\nTo '
                  f'delete: {video_faces_extracted - len(frames_names)}')

        print('**********************************************\nDone!\n')
        # Numbers should be equal in pairs.
        print(f'Number of videos: {len(todo_videos_names)}')
        print(f'Number of created directories: {dirs_created}\n')

        print(f'Number of frames: {num_frames}')
        print(f'Number of extracted faces: {_faces_extracted}')
        print(f'Number of faces to delete: {_faces_extracted - num_frames}')

    else:
        print('Nothing to extract...')