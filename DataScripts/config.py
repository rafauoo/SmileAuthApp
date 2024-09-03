import os

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
VIDEOS_DIR = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "data", "videos"))
FRAMES_DIR = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "data", "frames"))

TMP_DIR = os.path.abspath(os.path.join(os.sep, ROOT_DIR, "tmp"))
FACES_FEATURES_DET_FP = os.path.abspath(
    os.path.join(os.sep, ROOT_DIR, "data_prep", "shape_predictor_68_face_landmarks.dat")
)
DESIRED_FACE_PHOTO_WIDTH = 256
DESIRED_LEFT_EYE_POS = 0.35

NUM_FACES_FEATURES = 68
LIPS_CORNER1_IDX = 48
LIPS_CORNER2_IDX = 54
NOSE_TOP_IDX = 33
EYEBROWS_CORNERS_IDXS = [17, 21, 22, 26]

BEG_SMILE_THRESHOLD = 1
END_SMILE_THRESHOLD = 0.05
NUM_FRAMES_RISE_SMILE_BEG = 20
MIN_DIFF_IN_RISE_SMILE_BEG = 0.01
SMILE_DURATION_MIN_RATIO = 0.48

CURRENT_MIN_NUM_SMILE_FRAMES = 39

DESIRED_FACE_PHOTO_WIDTH = 256
DESIRED_LEFT_EYE_POS = 0.35
