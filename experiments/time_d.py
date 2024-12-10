from DataScripts.process.bulk_videos import process_videos
import os
import base64
from DataScripts.config import DATA_SCRIPTS_DIR, ROOT_DIR
import time
import argparse
# TESTING BULK VIDEO

def main():
    from_path = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "d", "videos"))
    out_path = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "experiments", "d", "out"))
    process_videos(from_path, out_path)


if __name__ == "__main__":
    main()