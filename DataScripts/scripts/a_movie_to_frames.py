import os
import sys
import cv2
import concurrent.futures
from config import TMP_DIR

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def save_frame(frame, frame_name):
    cv2.imwrite(frame_name, frame)

def movie_to_frames(id, video_name) -> None:
    """
    Exports frames from video file
    """
    print(f'**********************************************\n{id}\n')
    frames_dir = os.path.abspath(os.path.join(os.sep, TMP_DIR, str(id), "frames"))
    if not os.path.exists(frames_dir):
        os.makedirs(frames_dir)

    current_frame = 0
    video_path = os.path.abspath(os.path.join(os.sep, TMP_DIR, str(id), video_name))
    video = cv2.VideoCapture(video_path)

    os.chdir(frames_dir)
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        futures = []
        while True:
            success, frame = video.read()
            if success:
                frame_name = f'frame{str(current_frame)}.jpg'
                futures.append(executor.submit(save_frame, frame, frame_name))
                current_frame += 1
            else:
                break
        
        # Wait for all futures to complete
        for future in concurrent.futures.as_completed(futures):
            future.result()

    video.release()
    cv2.destroyAllWindows()

# Example usage
movie_to_frames('example_id', 'example_video.mp4')
