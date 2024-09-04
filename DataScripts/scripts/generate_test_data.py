import random


def generate_data():
    """Generates test data to check if model is working properly."""
    for file in range(100):
        num_samples = 39
        base_value = 1.0
        values = [base_value]
        if file % 2 == 0:
            for _ in range(num_samples - 1):
                next_value = values[-1] * (1 + random.uniform(0, 0.05))
                values.append(next_value)

            with open(
                f"DataScripts/outputs_test/{file+1:04}_spontaneous.mp4.csv", "w"
            ) as file:
                file.write("lips_corners_from_nose_angle\n")
                for value in values:
                    file.write(f"{value}\n")
        else:
            for _ in range(num_samples - 1):
                next_value = 1.01
                values.append(next_value)
            with open(
                f"DataScripts/outputs_test/{file+1:04}_deliberate.mp4.csv", "w"
            ) as file:
                file.write("lips_corners_from_nose_angle\n")
                for value in values:
                    file.write(f"{value}\n")


if __name__ == "__main__":
    generate_data()
