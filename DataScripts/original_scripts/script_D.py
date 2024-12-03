import os
import sys
import json
from fraction import Fraction
from DataScripts.config import ROOT_DIR

SMILES_DATA_DIR = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "0", "smiles_data"))
SMILES_DATA_FILE_PATH = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "0", "smiles_data", "smiles_data.json"))
def scale_frames(orig_len, req_len, beg_frame_num):
    fr = Fraction(orig_len, req_len)
    num, denom = fr.numerator, fr.denominator
    scaled_frames_nums = [i // denom + beg_frame_num for i in range(0, denom * orig_len, num)]
    return scaled_frames_nums

import time

def get_current_time_str():
    return time.strftime("%Y%m%d-%H%M%S")

def save_dict_to_json_file(path, title, data, time_str=None):
    if time_str is None:
        time_str = get_current_time_str()
        with open(os.path.abspath(os.path.join(os.sep, path, f'{title}.json')), 'w') as f:
            json.dump(data, f, indent=4)
        print('\nData successfully saved into the json file.\n')
    else:
        with open(os.path.abspath(os.path.join(os.sep, path, title)), 'w') as f:
            json.dump(data, f, indent=4)



def create_complete_smiles_data_file():
    with open(SMILES_DATA_FILE_PATH, 'r') as fp:
        smiles_data = json.load(fp)
    print(smiles_data)
    min_num_smile_frames = 39
    complete_frames_data, complete_smiles_data = [], {}
    for idx, sd in enumerate(smiles_data['frames']):
        _scaled_frames_nums = scale_frames(39, 39, sd['smile_beg_frame'])
        sd['scaled_frames_nums'] = _scaled_frames_nums
        complete_frames_data.append(sd)

    complete_smiles_data = {
        'smiles_data_file': rf'{SMILES_DATA_FILE_PATH}',
        'frames': complete_frames_data
    }

    scaled_frames_lens = [len(d['scaled_frames_nums']) for d in complete_smiles_data['frames']]
    lens_values = list(set(scaled_frames_lens))
    if len(lens_values) == 1 and lens_values[0] == min_num_smile_frames:
        print(f'Success: All videos have the same number of scaled frames numbers ({min_num_smile_frames}).')
        save_dict_to_json_file(SMILES_DATA_DIR, 'complete_smiles_data', complete_smiles_data)
    else:
        print(f'Error: All videos does NOT have the same number of scaled frames numbers. They should have: '
              f'{min_num_smile_frames}.')

if __name__ == '__main__':
    create_complete_smiles_data_file()