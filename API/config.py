import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API_DIR = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "API"))
API_CKPT = os.path.abspath(os.path.join(os.sep, API_DIR, "checkpoint"))
API_CKPT_PATH = os.path.join(os.sep, API_CKPT, "checkpoint.ckpt")
COMMENTS_PATH = os.path.join(os.sep, API_DIR, "comments.json")


VIDEO_LENGTH_LIMIT_MS = 6000
