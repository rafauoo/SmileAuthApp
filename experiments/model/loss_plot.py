import matplotlib.pyplot as plt
import pandas as pd
import os


def save_loss_plot(num):
    ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
    metrics = os.path.abspath(os.path.join(ROOT_DIR, str(num), "epoch_metrics.csv"))
    df = pd.read_csv(metrics)

    # Filtrujemy dane tylko dla fazy "val"
    val_data = df[df['phase'] == 'val']

    # Wybieramy co 10-tą epokę, aby wygładzić wykres
    val_data = val_data.iloc[::5, :]

    plt.figure(figsize=(10, 6))  # Większy wykres dla proporcji
    plt.plot(val_data['epoch'], val_data['loss'], color='red', linewidth=1)  # Cieńsza linia
    plt.xlabel('Epoka', fontsize=14)  # Większa czcionka dla osi
    plt.ylabel('Strata', fontsize=14)
    plt.title('Wartości funkcji straty na zbiorze walidacyjnym w kolejnych epokach', fontsize=16, pad=20)  # Większy tytuł
    plt.grid(True, linestyle='--', linewidth=0.5, alpha=0.7)  # Siatka z lekkim przezroczystym stylem
    plt.xticks(fontsize=12)  # Rozmiar czcionki osi X
    plt.yticks(fontsize=12)  # Rozmiar czcionki osi Y

    # Nie zaokrąglamy wartości do części setnych
    for tick in plt.gca().get_yticks():
        plt.gca().yaxis.set_major_formatter(plt.FuncFormatter(lambda x, _: f'{x:.2f}'))

    plt.tight_layout()  # Dopasowanie
    plt.subplots_adjust(left=0.1, right=0.95, top=0.9, bottom=0.1)  # Dodatkowe marginesy

    # Zapisujemy wykres do pliku
    plt.savefig(os.path.abspath(os.path.join(ROOT_DIR, str(num), "loss.png")), dpi=300)

save_loss_plot(1)
