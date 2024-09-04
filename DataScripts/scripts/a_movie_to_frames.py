import os
import cv2
import concurrent.futures
from cv2.typing import MatLike
from DataScripts.config import TMP_DIR


def save_frame(frame: MatLike, frame_name: str) -> None:
    """Saves a frame

    :param frame: frame
    :type frame: MatLike
    :param frame_name: name of saved file
    :type frame_name: str
    """
    cv2.imwrite(frame_name, frame)


def movie_to_frames(id: int, video_name: str) -> None:
    """Exports frames from video file

    :param id: movie ID
    :type id: int
    :param video_name: name of the video
    :type video_name: str
    """
    print(f"**********************************************\n{id}\n")
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
                frame_name = f"frame{str(current_frame)}.jpg"
                futures.append(executor.submit(save_frame, frame, frame_name))
                current_frame += 1
            else:
                break

        # Wait for all futures to complete
        for future in concurrent.futures.as_completed(futures):
            future.result()

    video.release()
    cv2.destroyAllWindows()
