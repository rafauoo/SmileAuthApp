import os
import pandas as pd
from DataScripts.config import DATA_DIR


def compare_csv_files(folder1, folder2):
    # Pobieramy listę plików z obu folderów
    files1 = set(os.listdir(folder1))
    files2 = set(os.listdir(folder2))

    # Znajdujemy wspólne pliki CSV
    common_files = files1.intersection(files2)
    different_files = []

    # Porównujemy zawartość wspólnych plików
    for file_name in common_files:
        if file_name.endswith(".csv"):
            path1 = os.path.join(folder1, file_name)
            path2 = os.path.join(folder2, file_name)

            # Wczytujemy pliki CSV
            df1 = pd.read_csv(path1)
            df2 = pd.read_csv(path2)
            if len(df2) != 39:
                print(path2)
            # Porównujemy pliki
            if not df1.equals(df2):
                different_files.append(file_name)

    # Wypisujemy, które pliki są różne
    if different_files:
        print("Pliki CSV, które są różne:")
        for file in sorted(different_files):
            print(file)
    else:
        print("Wszystkie wspólne pliki CSV są identyczne.")


if __name__ == "__main__":
    # Przykładowe użycie
    folder1 = os.path.abspath(
        os.path.join(os.sep, DATA_DIR, "outputs")
    )  # Zmień na właściwą ścieżkę do pierwszego folderu
    folder2 = os.path.abspath(
        os.path.join(os.sep, DATA_DIR, "outputs_new_flow")
    )  # Zmień na właściwą ścieżkę do drugiego folderu

    compare_csv_files(folder1, folder2)
