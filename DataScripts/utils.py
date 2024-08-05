import time
import numpy as np
import os
import re
import json

def landmarks_to_np(shape, dtype='int'):
    coords = np.zeros((68, 2), dtype=dtype)
    for i in range(0, 68):
        coords[i] = (shape.part(i).x, shape.part(i).y)
    return coords

def get_current_time_str():
    return time.strftime("%Y%m%d-%H%M%S")

def get_all_filenames(directory):
    return list(filter(None, [f for f in os.listdir(directory) if
                              os.path.isfile(os.path.join(directory, f)) and f[:2] != '._']))

def get_filenames_sorted_by_frame_num(directory):
    return sorted(get_all_filenames(directory), key=lambda n: get_frame_num(n))

def get_frame_num(name):
    return int(re.search(r'frame(\d+)', name).group(1))

def save_dict_to_json_file(path, title, data, time_str=None):
    if time_str is None:
        time_str = get_current_time_str()
        with open(os.path.abspath(os.path.join(os.sep, path, f'{title}-{time_str}.json')), 'w') as f:
            json.dump(data, f, indent=4)
        print('\nData successfully saved into the json file.\n')
    else:
        with open(os.path.abspath(os.path.join(os.sep, path, title)), 'w') as f:
            json.dump(data, f, indent=4)
