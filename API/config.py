import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API_DIR = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "API"))
API_MODEL_DIR = os.path.abspath(os.path.join(os.sep, API_DIR, "model"))
