import os
from DataScripts.config import ROOT_DIR
from DataScripts.flow.flow import generate_data
from concurrent.futures import ThreadPoolExecutor


def rename_videos():
    for num, file in enumerate(os.listdir(os.path.abspath(os.path.join(os.sep, ROOT_DIR, "videos_new")))):
        e_file = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "videos_new", file))
        if "deliberate" in file:
            os.rename(e_file, os.path.join(os.sep, ROOT_DIR, "videos_new", f"{num+1:04}_deliberate.mp4"))
        if "spontaneous" in file:
            os.rename(e_file, os.path.join(os.sep, ROOT_DIR, "videos_new", f"{num+1:04}_spontaneous.mp4"))

def process_video(file):
    e_file = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "videos_new", file))
    save_path = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "outputs_new_flow", f"{file}.csv"))
    with open(e_file, "rb") as video_file:
        video_bytes = video_file.read()
    angles = generate_data(video_bytes)
    angles.to_csv(save_path, index=False)
    os.remove(e_file)
    print(f"#{file[:4]} done")

def process_videos():
    video_files = os.listdir(os.path.abspath(os.path.join(os.sep, ROOT_DIR, "videos_new")))
    
    with ThreadPoolExecutor(max_workers=8) as executor:
        executor.map(process_video, video_files)

if __name__ == "__main__":
    #rename_videos()
    process_videos()
    # video_path = os.path.abspath(os.path.join(os.sep, TMP_DIR, "1013", "movie.mp4"))
    # save_path = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "1.csv"))
    # flow(video_path, save_path)