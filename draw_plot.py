import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Definiowanie macierzy
confusion_matrix = np.array([[463, 176], [113, 478]])

# Funkcja do wizualizacji macierzy błędów
def plot_confusion_matrix(matrix, labels, title="Macierz błędów"):
    plt.figure(figsize=(8, 6))
    sns.heatmap(matrix, annot=True, fmt="d", cmap="Blues", xticklabels=labels, yticklabels=labels)
    plt.title(title)
    plt.xlabel("Przewidywane")
    plt.ylabel("Rzeczywiste")
    plt.show()

# Etykiety klas
class_labels = ["Sztuczny", "Autentyczny"]

# Rysowanie macierzy
plot_confusion_matrix(confusion_matrix, class_labels)