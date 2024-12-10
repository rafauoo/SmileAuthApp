from DataScripts.scripts.a_movie_to_frames import movie_to_frames
from DataScripts.scripts.b_detect_faces import detect_faces
from DataScripts.scripts.c_detect_smiles import detect_smiles
from DataScripts.scripts.d_crop_smiles import crop_smiles
from DataScripts.scripts.e_smiles_to_csv_data import smiles_to_csv
import time
import argparse
# TESTING FIRST DATA SCRIPTS (multithreading on movie_to_frames)

MOVIE_NAME = "movie.mp4"

def main(range_number):
    for i in range(1,range_number+1):
        movie_to_frames(i,MOVIE_NAME)
        detect_faces(i,MOVIE_NAME)
        detect_smiles(i,MOVIE_NAME)
        crop_smiles(i,MOVIE_NAME)
        smiles_to_csv(i,MOVIE_NAME)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process a movie file and detect faces and smiles.")
    parser.add_argument(
        "--range", type=int, default=10, help="Number of iterations for processing (default: 10)"
    )
    args = parser.parse_args()
    main(args.range)