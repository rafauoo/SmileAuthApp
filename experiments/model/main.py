import argparse
from model.test import test
from acc_plot import save_acc_plot
from loss_plot import save_loss_plot


def main():
    # Ustawienie argumentów przyjmowanych z wiersza poleceń
    parser = argparse.ArgumentParser(description="Uruchomienie testów i generowanie wykresów.")
    parser.add_argument(
        "num",  # Argument pozycyjny
        type=int, 
        help="Numer folderu (NUM), z którego mają być pobrane dane."
    )
    args = parser.parse_args()

    # Pobranie argumentu NUM
    NUM = args.num

    # Wywołanie funkcji
    test(NUM)
    save_acc_plot(NUM)
    save_loss_plot(NUM)


if __name__ == "__main__":
    main()
