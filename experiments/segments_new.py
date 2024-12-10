from DataScripts.process.old_flow import export_frames_from_video, detect_faces_on_frames, detect_smiles, get_selected_ids, generate_data
import os
import base64
from DataScripts.config import DATA_SCRIPTS_DIR
import time
import argparse
# TESTING NEW FLOW (yield lazy evaluation)

def main(range_number):
    for i in range (1,range_number+1):
        with open(os.path.abspath(os.path.join(os.sep, DATA_SCRIPTS_DIR, "tmp",str(i),"movie.mp4")), "rb") as video_file:
            video_bytes = video_file.read()
            start = time.time()
            frames = export_frames_from_video(video_bytes)
            end = time.time()
            print("A: ", end - start)

            start = time.time()
            faces = detect_faces_on_frames(frames)
            end = time.time()
            print("B: ", end - start)

            start = time.time()
            smile_data = detect_smiles(faces)
            end = time.time()
            print("C: ", end - start)

            start = time.time()
            ids = get_selected_ids(smile_data)
            faces = [face for num, face in enumerate(faces) if num in ids]
            end = time.time()
            print("D: ", end - start)


            start = time.time()
            angles = generate_data(faces)
            end = time.time()
            print("E: ", end - start)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process a movie file and detect faces and smiles.")
    parser.add_argument(
        "--range", type=int, default=10, help="Number of iterations for processing (default: 10)"
    )
    args = parser.parse_args()
    main(args.range)