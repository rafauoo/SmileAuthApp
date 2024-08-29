import os
import pandas as pd
from sklearn.model_selection import train_test_split
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def load_data_from_csv(csv_dir):
    data = []
    for file_name in os.listdir(csv_dir):
        if file_name.endswith('.csv'):
            file_path = os.path.join(csv_dir, file_name)
            
            # Load the CSV file into a DataFrame
            df = pd.read_csv(file_path)
            line_count = len(df)

            # Check if the file has 39 lines (excluding the header)
            if line_count == 40:
                angles = df['lips_corners_from_nose_angle'].tolist()
                is_authentic = 1 if 'spontaneous' in file_name else 0
                data.append((angles, is_authentic))
            elif line_count < 40:
                # If less than 40 lines, copy last line(s) to make up to 40 lines
                # Calculate how many lines are needed
                needed_lines = 40 - line_count
                # Repeat the last line as needed
                last_line = df.iloc[-1].tolist()
                # Create a DataFrame with repeated lines
                additional_lines_df = pd.DataFrame([last_line] * needed_lines, columns=df.columns)
                # Append additional lines to the original DataFrame
                df = pd.concat([df, additional_lines_df], ignore_index=True)
                
                angles = df['lips_corners_from_nose_angle'].tolist()
                is_authentic = 1 if 'spontaneous' in file_name else 0
                data.append((angles, is_authentic))
            else:
                print(f"Skipped {file_name} due to incorrect number of lines: {line_count}")
                
    return data
