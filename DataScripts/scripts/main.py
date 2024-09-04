from DataScripts.scripts.a_movie_to_frames import movie_to_frames
from DataScripts.scripts.b_detect_faces import detect_faces
from DataScripts.scripts.c_detect_smiles import detect_smiles
from DataScripts.scripts.d_crop_smiles import crop_smiles
from DataScripts.scripts.e_smiles_to_csv_data import smiles_to_csv

VIDEO_ID = 1000
VIDEO_NAME = "movie.mp4"


def main():
    """To make a script work you need to create a folder named "TMP_DIR/<VIDEO_ID>"
    and copy the video to the folder (name it <VIDEO_NAME>).

    The scripts are quite slow due to multiple IO operations as well as eager evaluation.

    Try DataScripts.flow for faster processing.
    """
    movie_to_frames(VIDEO_ID, VIDEO_NAME)
    detect_faces(VIDEO_ID, VIDEO_NAME)
    detect_smiles(VIDEO_ID, VIDEO_NAME)
    crop_smiles(VIDEO_ID, VIDEO_NAME)
    smiles_to_csv(VIDEO_ID, VIDEO_NAME)


if __name__ == "__main__":
    main()
