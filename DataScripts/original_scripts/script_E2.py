import os
import sys
import json
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from DataScripts.config import ROOT_DIR, DATA_SCRIPTS_DIR
pd.options.mode.chained_assignment = None


FACES_FEATURES_DET_FP = os.path.abspath(
    os.path.join(
        os.sep,
        DATA_SCRIPTS_DIR,
        "face_features",
        "shape_predictor_68_face_landmarks.dat",
    )
)
DESIRED_FACE_PHOTO_WIDTH = 256
DESIRED_LEFT_EYE_POS = 0.35
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

BEG_SMILE_THRESHOLD = 1
END_SMILE_THRESHOLD = 0.05
NUM_FRAMES_RISE_SMILE_BEG = 20
MIN_DIFF_IN_RISE_SMILE_BEG = 0.01
SMILE_DURATION_MIN_RATIO = 0.48
FACES_SAME_LEN_DIR = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "0", "faces_same_len"))
FACES_FEATURES_DATA_DIR = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "0", "faces_features_data"))
FACES_FEATURES_DATA_WIDTH_DIR = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "0", "faces_features_data_256"))
CURRENT_SMILES_DATA_PLOTS_DIR = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "0", "current_smiles_data_plots"))
FACES_DIR = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "0", "faces"))
CURRENT_MIN_NUM_SMILE_FRAMES = 39
COMPLETE_SMILES_DATA_FILE_PATH = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "0", "smiles_data", "complete_smiles_data.json"))

CURRENT_MIN_NUM_SMILE_FRAMES = 39
FFS_DATA_ALT_MODES = ['lips_corners_from_nose_dist', 'lips_corners_from_nose_angle', 'lips_corners_dist']
FFS_DATA_CONFIG = {
    # 'features_name': 'lips_corners_dist',
    'features_name': 'lips_corners_from_nose_angle',
    # 'features_name': 'lips_corners_from_nose_dist',
    # 'features_name': 'lips_corners',
    #'features_name': 'face',
    # 'features_name': 'eyebrows_corners',
    #'features_name': 'all',
    #'mode': 'scaled',  # 'scaled' / 'k_first_in_smile' / 'k_first'
    'mode': 'k_first_in_smile',
    # 'mode': 'k_first',
    # 'mode': 'all',
    # 'features_nums': [LIPS_CORNER1_IDX, LIPS_CORNER2_IDX]
    # 'features_nums': list(range(NUM_FACES_FEATURES))
    # 'features_nums': EYEBROWS_CORNERS_IDXS
    # 'features_nums': create_face_features_nums()
}
DESIRED_FACE_PHOTO_WIDTH = 256
DESIRED_LEFT_EYE_POS = 0.35

def get_all_filenames(directory):
    return list(filter(None, [f for f in os.listdir(directory) if
                              os.path.isfile(os.path.join(directory, f)) and f[:2] != '._']))

def unit_vector(vector):
    return vector / np.linalg.norm(vector)


def angle_between(v1, v2):
    v1_u = unit_vector(v1)
    v2_u = unit_vector(v2)
    return np.arccos(np.clip(np.dot(v1_u, v2_u), -1.0, 1.0))


def calculate_dx_dy(left_lips_corner_x, left_lips_corner_y, right_lips_corner_x, right_lips_corner_y, nose_top_x,
                    nose_top_y):
    lc_dx = left_lips_corner_x - nose_top_x
    lc_dy = left_lips_corner_y - nose_top_y

    rc_dx = right_lips_corner_x - nose_top_x
    rc_dy = right_lips_corner_y - nose_top_y

    return lc_dx, lc_dy, rc_dx, rc_dy


def plot_smiles_data(values, frames, features_name, smile_label, plot_name):
    plt.figure(figsize=(15, 7))
    plt.plot(frames, values, '-o')

    if features_name == 'lips_corners_dist':
        title = 'Odległości kącików ust od siebie w kolejnych klatkach filmu w stosunku do wartości w pierwszej ' \
                'klatce filmu'
        ylabel = 'odl. kącików ust od siebie w st. do wart. w pierwszej kl. filmu'
    elif features_name == 'lips_corners_from_nose_angle':
        title = 'Kąt pomiędzy kącikami ust a środkiem nosa w kolejnych klatkach filmu w stosunku do wartości w ' \
                'pierwszej klatce filmu'
        ylabel = 'kąt pom. kącikami ust a śr. nosa w st. do wart. w pierwszej kl. filmu'
    elif features_name == 'lips_corners_from_nose_dist':
        title = 'Średnia odległość kącików ust od środka nosa w kolejnych klatkach filmu w stosunku do wartości w ' \
                'pierwszej klatce filmu'
        ylabel = 'śr. odl. kącików ust od śr. nosa w st. do wart. w pierwszej kl. filmu'
    else:
        raise Exception('Incorrect features name.')

    plt.title(title)
    plt.xlabel('numer klatki')
    plt.ylabel(ylabel)

    plot_dir = os.path.abspath(os.path.join(os.sep, CURRENT_SMILES_DATA_PLOTS_DIR, smile_label, f'{plot_name}.png'))
    plt.savefig(plot_dir)
    plt.clf()


def prepare_smiles_data(features_name, mode, features_nums=None, save_plot_mode=False):
    if not os.path.exists(FACES_FEATURES_DATA_DIR):
        os.makedirs(FACES_FEATURES_DATA_DIR)

    data_files_names = get_all_filenames(FACES_FEATURES_DATA_WIDTH_DIR)
    data_files_prepared = 0
    plots_saved = 0

    with open(COMPLETE_SMILES_DATA_FILE_PATH, 'r') as fp:
        smiles_data = json.load(fp)['frames']

    len_to_cut, min_num_frames = None, None
    if mode == 'k_first_in_smile':
        len_to_cut = 39
    if mode == 'k_first':
        min_num_frames = min([d['num_frames'] for d in smiles_data])  # 55

    output_data_x_filepath = os.path.abspath(os.path.join(os.sep, FACES_FEATURES_DATA_DIR,
                                                          f'{features_name}_{mode}_x.csv'))

    for num, data_file_name in enumerate(data_files_names):
        if save_plot_mode is True and num >= 100:
            break
        data_x_filepath = os.path.abspath(os.path.join(os.sep, FACES_FEATURES_DATA_WIDTH_DIR, data_file_name))
        video_name = data_file_name.split('.csv')[0]

        data = pd.read_csv(data_x_filepath, delimiter=';')

        frames_nums = []
        if mode == 'scaled':
            frames_nums = [video['scaled_frames_nums'] for video in smiles_data if video['video_name'] ==
                           video_name][0]
        elif mode == 'k_first_in_smile':
            for video in smiles_data:
                if video['video_name'] == video_name:
                    smile_beg_frame = video['smile_beg_frame']
                    frames_nums = list(range(smile_beg_frame, smile_beg_frame + len_to_cut + 1))
                    break
        elif mode == 'k_first':
            frames_nums = list(range(min_num_frames))
        elif mode == 'all':
            pass
        else:
            raise Exception('Incorrect "mode" given. Options to choose: "scaled" | "k_first_in_smile" | "k_first"\n')

        if frames_nums:
            selected_data_x = data[data['frame_number'].isin(frames_nums)]
        else:
            selected_data_x = data
        print(selected_data_x)
        if features_nums is not None:
            selected_columns = [col_name for col_name in selected_data_x.columns if col_name != 'frame_number' and
                                int(col_name[:-1]) in features_nums]
            selected_data_x = selected_data_x[selected_columns]
        elif features_name in FFS_DATA_ALT_MODES:  # taking not only raw faces features points
            left_lips_corner_x = selected_data_x[f'{LIPS_CORNER1_IDX}x']
            left_lips_corner_y = DESIRED_FACE_PHOTO_WIDTH - selected_data_x[f'{LIPS_CORNER1_IDX}y']

            right_lips_corner_x = selected_data_x[f'{LIPS_CORNER2_IDX}x']
            right_lips_corner_y = DESIRED_FACE_PHOTO_WIDTH - selected_data_x[f'{LIPS_CORNER2_IDX}y']

            nose_top_x = selected_data_x[f'{NOSE_TOP_IDX}x']
            nose_top_y = DESIRED_FACE_PHOTO_WIDTH - selected_data_x[f'{NOSE_TOP_IDX}y']

            if features_name == 'lips_corners_from_nose_dist':
                lc_dx, lc_dy, rc_dx, rc_dy = calculate_dx_dy(left_lips_corner_x, left_lips_corner_y,
                                                             right_lips_corner_x, right_lips_corner_y, nose_top_x,
                                                             nose_top_y)
                lc_dist = np.sqrt((lc_dx ** 2) + (lc_dy ** 2))
                rc_dist = np.sqrt((rc_dx ** 2) + (rc_dy ** 2))
                av_dist = (lc_dist + rc_dist) / 2
                av_dist /= av_dist.iloc[0]
                selected_data_x[features_name] = av_dist
                selected_data_x = pd.DataFrame(selected_data_x[features_name])
            elif features_name == 'lips_corners_from_nose_angle':
                angles = []
                lc_dx, lc_dy, rc_dx, rc_dy = calculate_dx_dy(left_lips_corner_x, left_lips_corner_y,
                                                             right_lips_corner_x, right_lips_corner_y, nose_top_x,
                                                             nose_top_y)
                for i in range(len(lc_dx)):
                    v1 = lc_dx.iloc[i], lc_dy.iloc[i]
                    v2 = rc_dx.iloc[i], rc_dy.iloc[i]
                    angles.append(angle_between(v1, v2))
                angles = list(map(lambda el: el/angles[0], angles))
                selected_data_x = pd.DataFrame(angles, columns=[features_name])
            elif features_name == 'lips_corners_dist':
                dx = right_lips_corner_x - left_lips_corner_x
                dy = right_lips_corner_y - left_lips_corner_y
                corners_dist = np.sqrt((dx ** 2) + (dy ** 2))
                corners_dist /= corners_dist.iloc[0]
                selected_data_x[features_name] = corners_dist
                selected_data_x = pd.DataFrame(selected_data_x[features_name])

        selected_data_x['video_name'] = video_name
        # set 'video_name' columns as first
        vn_col = selected_data_x['video_name']
        selected_data_x.drop(labels=['video_name'], axis=1, inplace=True)
        selected_data_x.insert(0, 'video_name', vn_col)

        if save_plot_mode is False:
            if num != 0:
                selected_data_x.to_csv(output_data_x_filepath, mode='a', sep=';', index=False, header=False)
            else:
                selected_data_x.to_csv(output_data_x_filepath, sep=';', index=False, header=True)
            data_files_prepared += 1
        else:
            data_to_plot = selected_data_x[features_name]
            frames = list(range([video['num_frames'] for video in smiles_data if video['video_name'] == video_name][0]))
            if SMILE_ORIGINAL_LABELS[0] in data_file_name:
                smile_label = SMILE_ORIGINAL_LABELS[0]
            elif SMILE_ORIGINAL_LABELS[1] in data_file_name:
                smile_label = SMILE_ORIGINAL_LABELS[1]
            else:
                raise Exception('No correct smile label in the video data file name.')
            plot_smiles_data(values=data_to_plot, frames=frames, features_name=features_name, smile_label=smile_label,
                             plot_name=data_file_name)
            plots_saved += 1

    print(f'Done! Successfully scaled {data_files_prepared} data files into the new csv files and saved {plots_saved} '
          f'plots.')


if __name__ == '__main__':
    # Change if needed.
    prepare_smiles_data(FFS_DATA_CONFIG['features_name'], mode=FFS_DATA_CONFIG['mode'],
                        features_nums=None)
    # prepare_smiles_data(FFS_DATA_CONFIG['features_name'], mode=FFS_DATA_CONFIG['mode'])
    # prepare_smiles_data(FFS_DATA_CONFIG['features_name'], mode=FFS_DATA_CONFIG['mode'], save_plot_mode=True)
