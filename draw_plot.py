import pandas as pd
import matplotlib.pyplot as plt

# Wczytanie danych z pliku CSV
csv_file = "epoch_metrics.csv"  # Zmień na ścieżkę do swojego pliku
data = pd.read_csv(csv_file)

# Filtrowanie danych dla fazy 'val'
val_data = data[data['phase'] == 'val']

# Wybieranie co 10-tej epoki dla rzadszego wykresu
val_data = val_data[val_data['epoch'] % 10 == 0]

# Rysowanie wykresu dokładności dla fazy 'val'
plt.figure(figsize=(8, 6))
plt.plot(val_data['epoch'], val_data['accuracy'], color='red')
plt.title('Dokładność na zbiorze walidacyjnym w kolejnych epokach')
plt.xlabel('Epoka')
plt.ylabel('Dokładność')
plt.grid(True)

# Ograniczenie osi i rzadsze etykiety osi
ax = plt.gca()
ax.set_xlim([0, 2000])
ax.set_ylim(0.5, 0.8)
plt.xticks(range(0, 2001, 200))  # Etykiety osi X co 200 epok

plt.show()
