import os
import sys
import cv2
from DataScripts.config import ROOT_DIR

FRAMES_DIR =  from_path = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "0", "frames"))
VIDEOS_DIR = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "0", "videos"))

def get_all_filenames(directory):
    return list(filter(None, [f for f in os.listdir(directory) if
                              os.path.isfile(os.path.join(directory, f)) and f[:2] != '._']))

if __name__ == '__main__':
    if os.path.exists(FRAMES_DIR) and os.listdir(FRAMES_DIR):  # Exists and is not empty.:
        raise Exception('Videos frames directory is not empty so the program supposes that the faces have been already '
              'extracted.\n')

    if not os.path.exists(FRAMES_DIR):
        os.makedirs(FRAMES_DIR)

    videos_names = get_all_filenames(VIDEOS_DIR)
    frames_sets_created = 0

    for video_name in videos_names:
        print(f'**********************************************\n{video_name}\n')

        # create dir for the video's frames
        video_frames_dir = os.path.abspath(os.path.join(os.sep, FRAMES_DIR, video_name))
        if not os.path.exists(video_frames_dir):
            os.makedirs(video_frames_dir)

        current_frame = 0
        video_path = os.path.abspath(os.path.join(os.sep, VIDEOS_DIR, video_name))
        video = cv2.VideoCapture(video_path)

        # create frames
        os.chdir(video_frames_dir)
        frames_created = False
        while True:
            success, frame = video.read()
            if success:
                frames_created = True
                frame_name = f'{video_name}_frame{str(current_frame)}.jpg'
                print(f'Creating {frame_name}...')
                cv2.imwrite(frame_name, frame)
                current_frame += 1
            else:
                if frames_created:
                    frames_sets_created += 1
                break

        video.release()
        cv2.destroyAllWindows()

    print('Done!\n')
    print(f'Number of videos: {len(videos_names)}')
    print(f'Number of frames sets created: {frames_sets_created}')
