import os
import sys
import cv2
import dlib
import csv
import numpy as np

from DataScripts.config import ROOT_DIR, DATA_SCRIPTS_DIR

FACES_SAME_LEN_DIR = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "0", "faces_same_len"))
FACES_FEATURES_DATA_DIR = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "0", "faces_features_data"))
FACES_FEATURES_WIDTH_DIR = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "0", "faces_features_256"))
FACES_FEATURES_DATA_WIDTH_DIR = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "0", "faces_features_data_256"))
FRAMES_DIR =  from_path = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "0", "frames"))
VIDEOS_DIR = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "0", "videos"))
FACES_DIR = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "0", "faces"))
NEW_FACES_DIR = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "0", "new_faces"))
SMILES_DATA_DIR = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "0", "smiles_data"))
NUM_FACES_FEATURES = 68
LIPS_CORNER1_IDX = 48
LIPS_CORNER2_IDX = 54
NOSE_TOP_IDX = 33
SMILE_ORIGINAL_LABELS = ['deliberate', 'spontaneous']
EYEBROWS_CORNERS_IDXS = [17, 21, 22, 26]
FACES_FEATURES_DET_FP = os.path.abspath(
    os.path.join(
        os.sep,
        DATA_SCRIPTS_DIR,
        "face_features",
        "shape_predictor_68_face_landmarks.dat",
    )
)
def get_all_subdirs(directory):
    return list(filter(None, [f for f in os.listdir(directory)]))


def landmarks_to_np(shape, dtype='int'):
    coords = np.zeros((68, 2), dtype=dtype)
    for i in range(0, 68):
        coords[i] = (shape.part(i).x, shape.part(i).y)
    return coords

import re
def get_frame_num(name):
    return int(re.search(r'frame(\d+)', name).group(1))

def get_all_filenames(directory):
    return list(filter(None, [f for f in os.listdir(directory) if
                              os.path.isfile(os.path.join(directory, f)) and f[:2] != '._']))
def get_filenames_sorted_by_frame_num(directory):
    return sorted(get_all_filenames(directory), key=lambda n: get_frame_num(n))

f1 = lambda num: f'{num}x'
f2 = lambda num: f'{num}y'
header = ['frame_number'] + [f(i) for i in range(NUM_FACES_FEATURES) for f in (f1, f2)]


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


if __name__ == '__main__':
    if not os.path.exists(FACES_FEATURES_WIDTH_DIR):
        os.makedirs(FACES_FEATURES_WIDTH_DIR)

    if not os.path.exists(FACES_FEATURES_DATA_WIDTH_DIR):
        os.makedirs(FACES_FEATURES_DATA_WIDTH_DIR)

    videos_names = get_all_subdirs(FACES_DIR)
    done_videos_names = get_all_subdirs(FACES_FEATURES_WIDTH_DIR)
    todo_videos_names = [vn for vn in videos_names if vn not in done_videos_names]

    print('all videos: ', len(videos_names))
    print('done videos: ', len(done_videos_names))
    print('videos to do: ', len(todo_videos_names))

    if todo_videos_names:
        detector = dlib.get_frontal_face_detector()
        predictor = dlib.shape_predictor(FACES_FEATURES_DET_FP)

        num_faces, dirs_created, data_files_created, imgs_created, rows_added = 0, 0, 0, 0, 0

        for video_name in todo_videos_names:
            # create dir for the faces features
            faces_features_dir = os.path.abspath(os.path.join(os.sep, FACES_FEATURES_WIDTH_DIR, video_name))
            faces_dir = os.path.abspath(os.path.join(os.sep, FACES_DIR, video_name))
            faces_names = get_filenames_sorted_by_frame_num(faces_dir)
            video_imgs_created = 0
            video_rows_added = 0

            if not os.path.exists(faces_features_dir):
                print(f'**********************************************\n{video_name}\n')

                os.makedirs(faces_features_dir)
                dirs_created += 1
                num_faces += len(faces_names)

                faces_features_data_filepath = os.path.abspath(os.path.join(os.sep, FACES_FEATURES_DATA_WIDTH_DIR,
                                                                            f'{video_name}.csv'))
                f, _writer = create_ff_data_file_writer(faces_features_data_filepath)

                for face_name in faces_names:
                    face_path = os.path.abspath(os.path.join(os.sep, faces_dir, face_name))

                    img = cv2.imread(face_path)
                    gray = cv2.cvtColor(src=img, code=cv2.COLOR_BGR2GRAY)
                    _frame_number = get_frame_num(face_name)

                    faces = detector(gray)
                    for face in faces:
                        # save in the data file
                        _landmarks = predictor(image=gray, box=face)

                        save_landmarks_row(_writer, _landmarks, _frame_number)
                        rows_added += 1
                        video_rows_added += 1
                        # draw on the image
                        for n in range(NUM_FACES_FEATURES):
                            _x = _landmarks.part(n).x
                            _y = _landmarks.part(n).y
                            cv2.circle(img=img, center=(_x, _y), radius=3, color=(0, 255, 0), thickness=-1)

                    # save an image with marked face features
                    os.chdir(faces_features_dir)
                    cv2.imwrite(face_name, img)
                    imgs_created += 1
                    video_imgs_created += 1

                f.close()
                print(f'{video_name}.csv face features data file created successfully.')
                data_files_created += 1
                print(f'Number of faces: {len(faces_names)}\nNumber of images created: {video_imgs_created}\n'
                      f'Number of rows added: {video_rows_added}')

        print('**********************************************\nDone!\n')
        print(f'Number of faces videos: {len(todo_videos_names)}')
        print(f'Number of created directories: {dirs_created}')
        print(f'Number of created data files: {data_files_created}\n')

        print(f'Number of faces: {num_faces}')
        print(f'Number of created images: {imgs_created}')
        print(f'Number of added rows: {rows_added}')

    else:
        print('No faces to detect face features...')
