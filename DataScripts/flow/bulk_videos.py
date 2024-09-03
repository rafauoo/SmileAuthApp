import os
from DataScripts.config import ROOT_DIR
from DataScripts.flow.flow import flow
from concurrent.futures import ThreadPoolExecutor


def process_video(file):
    e_file = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "videos_new", file))
    save_path = os.path.abspath(
        os.path.join(os.sep, ROOT_DIR, "outputs_new_flow", f"{file}.csv")
    )
    with open(e_file, "rb") as video_file:
        video_bytes = video_file.read()
    angles = flow(video_bytes)
    angles.to_csv(save_path, index=False)
    os.remove(e_file)
    print(f"#{file[:4]} done")


def process_videos():
    video_files = os.listdir(
        os.path.abspath(os.path.join(os.sep, ROOT_DIR, "videos_new"))
    )

    with ThreadPoolExecutor(max_workers=8) as executor:
        executor.map(process_video, video_files)


if __name__ == "__main__":
    process_videos()
