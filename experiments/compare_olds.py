from DataScripts.scripts.a_movie_to_frames import movie_to_frames
from DataScripts.scripts.b_detect_faces import detect_faces
from DataScripts.scripts.c_detect_smiles import detect_smiles
from DataScripts.scripts.d_crop_smiles import crop_smiles
from DataScripts.scripts.e_smiles_to_csv_data import smiles_to_csv
from DataScripts.process.old_flow import flow
import time

# TESTING FIRST DATA SCRIPTS (multithreading on movie_to_frames)

MOVIE_NAME = "movie.mp4"
RANGE = 10
def main():
    start = time.time()
    for i in range(1,RANGE+1):
        movie_to_frames(i,MOVIE_NAME)
        detect_faces(i,MOVIE_NAME)
        detect_smiles(i,MOVIE_NAME)
        crop_smiles(i,MOVIE_NAME)
        smiles_to_csv(i,MOVIE_NAME)
    end = time.time()
    print(f"TEST A RESULT ({RANGE})")
    print(end - start)


if __name__ == "__main__":
    main()