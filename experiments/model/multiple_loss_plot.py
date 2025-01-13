import matplotlib.pyplot as plt
import pandas as pd
import argparse
import os


def save_loss_plot(nums):
    ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

    plt.figure(figsize=(10, 6))  # Większy wykres dla proporcji

    # Iterujemy po wszystkich podanych numerach
    for num in nums:
        metrics = os.path.abspath(os.path.join(ROOT_DIR, str(num), "epoch_metrics.csv"))
        df = pd.read_csv(metrics)

        # Filtrujemy dane tylko dla fazy "val"
        val_data = df[df['phase'] == 'val']

        # Wybieramy co 5-tą epokę, aby wygładzić wykres
        val_data = val_data.iloc[::10, :]

        # Dodajemy linię na wykres
        plt.plot(
            val_data['epoch'], 
            val_data['loss'], 
            linewidth=1, 
            label=f'{num}'  # Etykieta wykresu
        )

    # Ustawienia wykresu
    plt.xlabel('Epoka', fontsize=14)  # Większa czcionka dla osi
    plt.ylabel('Strata', fontsize=14)
    plt.title('Wartości funkcji straty na zbiorze walidacyjnym w kolejnych epokach', fontsize=16, pad=20)  # Większy tytuł
    plt.grid(True, linestyle='--', linewidth=0.5, alpha=0.7)  # Siatka z lekkim przezroczystym stylem
    plt.xticks(fontsize=12)  # Rozmiar czcionki osi X
    plt.yticks(fontsize=12)  # Rozmiar czcionki osi Y

    # Nie zaokrąglamy wartości do części setnych
    for tick in plt.gca().get_yticks():
        plt.gca().yaxis.set_major_formatter(plt.FuncFormatter(lambda x, _: f'{x:.2f}'))

    plt.legend(fontsize=12)  # Dodanie legendy
    plt.tight_layout()  # Dopasowanie
    plt.subplots_adjust(left=0.1, right=0.95, top=0.9, bottom=0.1)  # Dodatkowe marginesy

    # Zapisujemy wykres do pliku
    plt.savefig(os.path.abspath(os.path.join(ROOT_DIR, "loss_combined.png")), dpi=300)
    plt.close()


if __name__ == "__main__":
    # Tworzymy parser argumentów
    parser = argparse.ArgumentParser(description="Generowanie wykresu strat dla wielu numerów.")
    parser.add_argument(
        "nums", 
        metavar="N", 
        type=int, 
        nargs="+",  # "+" oznacza, że można podać jeden lub więcej numerów
        help="Numery folderów do przetworzenia"
    )

    args = parser.parse_args()
    save_loss_plot(args.nums)

