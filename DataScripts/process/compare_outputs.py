import os
import pandas as pd
from DataScripts.config import DATA_DIR

"""
This module was created to compare outputs of old and a new flow.
"""


def compare_csv_files(folder1: str, folder2: str) -> None:
    """Compares two folders of csv files.

    :param folder1: folder 1
    :type folder1: str
    :param folder2: folder 2
    :type folder2: str
    """
    files1 = set(os.listdir(folder1))
    files2 = set(os.listdir(folder2))

    common_files = files1.intersection(files2)
    different_files = []

    for file_name in common_files:
        if file_name.endswith(".csv"):
            path1 = os.path.join(folder1, file_name)
            path2 = os.path.join(folder2, file_name)
            df1 = pd.read_csv(path1)
            df2 = pd.read_csv(path2)
            if len(df2) != 39:
                print(path2)
            if not df1.equals(df2):
                different_files.append(file_name)

    if different_files:
        print("different CSVs:")
        for file in sorted(different_files):
            print(file)
    else:
        print("all files are identical")


if __name__ == "__main__":
    folder1 = os.path.abspath(os.path.join(os.sep, DATA_DIR, "outputs"))
    folder2 = os.path.abspath(
        os.path.join(os.sep, DATA_DIR, "outputs_new_flow")
    )
    compare_csv_files(folder1, folder2)
