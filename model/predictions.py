import os
import sys
import pandas as pd
from tqdm.auto import tqdm
import torch
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from model.model_lstm import SmileAuthenticityPredictor
from dataset_loader import FacesFeaturesDataset
from model_config import COL_LEN, CLASSES, CLASSES_STRS


def show_conf_matrix(conf_matrix):
    hmap = sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues')
    hmap.yaxis.set_ticklabels(hmap.yaxis.get_ticklabels(), rotation=0, ha='right')
    hmap.xaxis.set_ticklabels(hmap.xaxis.get_ticklabels(), rotation=0, ha='right')
    plt.title('Macierz błędów sieci LSTM')
    plt.ylabel('rzeczywista autentyczność')
    plt.xlabel('przewidziana autentyczność')
    plt.show()


def review_predictions(trainer, test_data):
    # Determine the device (GPU if available, else CPU)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Load the trained model and move it to the appropriate device
    trained_model = SmileAuthenticityPredictor.load_from_checkpoint(
        trainer.checkpoint_callback.best_model_path,
        num_features=COL_LEN,
        num_classes=len(CLASSES)
    )
    trained_model.to(device)
    trained_model.freeze()

    # Create the test dataset
    test_dataset = FacesFeaturesDataset(test_data)
    predictions, auths = [], []

    for item in tqdm(test_dataset):
        ffs = item['faces_features'].to(device)  # Move input tensor to the same device as the model
        auth = item['authenticity']

        _, output = trained_model(ffs.unsqueeze(dim=0))
        prediction = torch.argmax(output, dim=1)
        predictions.append(prediction.item())
        auths.append(auth.item())

    # Print classification report
    print(classification_report(auths, predictions, target_names=CLASSES_STRS))

    # Create confusion matrix
    cm = confusion_matrix(auths, predictions)
    cm_df = pd.DataFrame(
        cm, index=CLASSES, columns=CLASSES
    )

    # Display confusion matrix
    show_conf_matrix(cm_df)


