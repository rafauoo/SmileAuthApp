from scripts.a_movie_to_frames import movie_to_frames
from scripts.b_detect_faces import detect_faces
from scripts.c_detect_smiles import detect_smiles
from scripts.d_crop_smiles import crop_smiles
from scripts.e_smiles_to_csv_data import smiles_to_csv
def main():
    movie_to_frames(1013, "movie.mp4")
    detect_faces(1013, "movie.mp4")
    detect_smiles(1013, "movie.mp4")
    crop_smiles(1013, "movie.mp4")
    smiles_to_csv(1013, "movie.mp4")

if __name__ == "__main__":
    main()
        
