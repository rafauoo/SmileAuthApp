from DataScripts.scripts.a_movie_to_frames import movie_to_frames
from DataScripts.scripts.b_detect_faces import detect_faces
from DataScripts.scripts.c_detect_smiles import detect_smiles
from DataScripts.scripts.d_crop_smiles import crop_smiles
from DataScripts.scripts.e_smiles_to_csv_data import smiles_to_csv

VIDEO_ID = 1000


def main():
    movie_to_frames(VIDEO_ID, "movie.mp4")
    detect_faces(VIDEO_ID, "movie.mp4")
    detect_smiles(VIDEO_ID, "movie.mp4")
    crop_smiles(VIDEO_ID, "movie.mp4")
    smiles_to_csv(VIDEO_ID, "movie.mp4")


if __name__ == "__main__":
    main()