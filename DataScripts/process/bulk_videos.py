import os
from DataScripts.config import ROOT_DIR
from DataScripts.process.flow import flow
from concurrent.futures import ThreadPoolExecutor


"""
Use this module to process whole directory of videos at once.
It uses multithreading to make it faster.
"""


def process_video(from_path: str, out_path: str, file: str) -> None:
    """Process single video file

    :param from_path: from folder path
    :type from_path: str
    :param out_path: out folder path
    :type out_path: str
    :param file: video file path
    :type file: str
    """
    e_file = from_path + "\\" + file
    save_path = out_path + "\\" + file + ".csv"
    with open(e_file, "rb") as video_file:
        video_bytes = video_file.read()
    angles = flow(video_bytes)
    angles.to_csv(save_path, index=False)
    os.remove(e_file)
    print(f"#{file[:4]} done")


def process_videos(from_path: str, out_path: str) -> None:
    """Process whole directory of videos with multithreading.

    :param path: path of the directory to process
    :type path: str
    """
    video_files = os.listdir(from_path)
    from_paths = [from_path for i in range(0, len(video_files))]
    out_paths = [out_path for i in range(0, len(video_files))]
    with ThreadPoolExecutor(max_workers=8) as executor:
        executor.map(process_video, from_paths, out_paths, video_files)


if __name__ == "__main__":
    process_videos(
        os.path.abspath(os.path.join(os.sep, ROOT_DIR, "videos_new"))
    )
