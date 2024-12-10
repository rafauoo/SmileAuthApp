from DataScripts.process.old_flow import flow
import os
import base64
from DataScripts.config import DATA_SCRIPTS_DIR
import time
import argparse
# TESTING OLD FLOW (no multithreading)

def main(range_number):
    for i in range (1,range_number+1):
        with open(os.path.abspath(os.path.join(os.sep, DATA_SCRIPTS_DIR, "tmp",str(i),"movie.mp4")), "rb") as video_file:
            video_bytes = video_file.read()
            values = flow(video_bytes)
            values.to_csv(os.path.abspath(os.path.join(os.sep, DATA_SCRIPTS_DIR, "tmp",str(i),"data_b.csv")), sep=";", index=False, header=True)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process a movie file and detect faces and smiles.")
    parser.add_argument(
        "--range", type=int, default=10, help="Number of iterations for processing (default: 10)"
    )
    args = parser.parse_args()
    main(args.range)