import random
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
def generate_data():
    for file in range(100):
        # Przykładowa liczba próbek do wygenerowania
        num_samples = 39
        
        # Wartości początkowe (zdefiniowane lub losowe)
        base_value = 1.0
        values = [base_value]
        
        # Generowanie kolejnych wartości na podstawie poprzednich
        if file % 2 == 0:
            for _ in range(num_samples - 1):
                next_value = values[-1] * (1 + random.uniform(0, 0.05))  # Dodanie losowej zmiany do poprzedniej wartości
                values.append(next_value)
            
            # Zapisanie wartości do pliku
            with open(f"DataScripts/outputs_test/{file+1:04}_spontaneous.mp4.csv", "w") as file:
                file.write("lips_corners_from_nose_angle\n")
                for value in values:
                    file.write(f"{value}\n")
        else:
            for _ in range(num_samples - 1):
                next_value = 1.01  # Dodanie losowej zmiany do poprzedniej wartości
                values.append(next_value)
            
            # Zapisanie wartości do pliku
            with open(f"DataScripts/outputs_test/{file+1:04}_deliberate.mp4.csv", "w") as file:
                file.write("lips_corners_from_nose_angle\n")
                for value in values:
                    file.write(f"{value}\n")

# Wywołanie funkcji generującej plik
generate_data()
