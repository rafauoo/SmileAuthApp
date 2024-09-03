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
    plt.figure(figsize=(8, 6))
    hmap = sns.heatmap(
        conf_matrix,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=CLASSES_STRS,
        yticklabels=CLASSES_STRS,
    )
    hmap.yaxis.set_ticklabels(hmap.yaxis.get_ticklabels(), rotation=0, ha="right")
    hmap.xaxis.set_ticklabels(hmap.xaxis.get_ticklabels(), rotation=0, ha="right")
    plt.title("Confusion Matrix")
    plt.ylabel("Actual Label")
    plt.xlabel("Predicted Label")
    plt.show()


def review_predictions(trainer, test_data, ckpt_path):
    # Determine the device (GPU if available, else CPU)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Load the trained model and move it to the appropriate device
    trained_model = SmileAuthenticityPredictor.load_from_checkpoint(
        ckpt_path, num_features=COL_LEN, num_classes=len(CLASSES)
    )
    trained_model.to(device)
    trained_model.freeze()
    trained_model.eval()

    # Create the test dataset
    test_dataset = FacesFeaturesDataset(test_data)
    predictions, auths = [], []

    for item in tqdm(test_dataset):
        ffs = item["faces_features"].to(
            device
        )  # Move input tensor to the same device as the model
        auth = item["authenticity"]

        _, output = trained_model(ffs.unsqueeze(dim=0))
        prediction = torch.argmax(output, dim=1)
        predictions.append(prediction.item())
        auths.append(auth.item())
    print(predictions)
    print(auths)
    # Print classification report
    print(classification_report(auths, predictions, target_names=CLASSES_STRS))

    # Create confusion matrix
    cm = confusion_matrix(auths, predictions)
    print(cm)
    cm_df = pd.DataFrame(cm, index=CLASSES, columns=CLASSES)

    # Display confusion matrix
    show_conf_matrix(cm_df)
