import matplotlib.pyplot as plt
import pandas as pd
import os
import argparse
from model.test import test2


def print_accuracy(nums):
    accs = []
    for num in nums:
        accs.append(test2(num))
    
    for num, acc in zip(nums,accs):
        print(num, acc)


if __name__ == "__main__":
    # Tworzymy parser argumentów
    parser = argparse.ArgumentParser(description="Generowanie wykresu dokładności dla wielu numerów.")
    parser.add_argument(
        "nums", 
        metavar="N", 
        type=int, 
        nargs="+",  # "+" oznacza, że można podać jeden lub więcej numerów
        help="Numery folderów do przetworzenia"
    )

    args = parser.parse_args()
    print_accuracy(args.nums)

