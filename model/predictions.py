import torch
import seaborn as sns
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from tqdm.auto import tqdm
from sklearn.metrics import classification_report, confusion_matrix
from model.lstm import SmileAuthenticityPredictor
from model.dataloader import FacesFeaturesDataset
from model.config import COL_LEN, CLASSES, CLASSES_STRS, CLASSES_NAMES


def show_conf_matrix(conf_matrix: np.ndarray) -> None:
    """Creates confusion matrix plot

    :param conf_matrix: confustion matrix array
    :type conf_matrix: np.ndarray
    """
    plt.figure(figsize=(8, 6))
    hmap = sns.heatmap(
        conf_matrix,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=CLASSES_STRS,
        yticklabels=CLASSES_STRS,
    )
    hmap.yaxis.set_ticklabels(
        hmap.yaxis.get_ticklabels(), rotation=0, ha="right"
    )
    hmap.xaxis.set_ticklabels(
        hmap.xaxis.get_ticklabels(), rotation=0, ha="right"
    )
    plt.title("Confusion Matrix")
    plt.ylabel("Actual Label")
    plt.xlabel("Predicted Label")
    plt.show()


def review_predictions(test_data: pd.DataFrame, ckpt_path: str) -> None:
    """Reviews predictions for test data given the checkpoint path.

    :param test_data: test data
    :type test_data: pd.DataFrame
    :param ckpt_path: model checkpoint path
    :type ckpt_path: str
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    trained_model = SmileAuthenticityPredictor.load_from_checkpoint(
        ckpt_path, num_features=COL_LEN, num_classes=len(CLASSES)
    )
    trained_model.to(device)
    trained_model.freeze()
    trained_model.eval()

    test_dataset = FacesFeaturesDataset(test_data)
    predictions, auths = [], []

    for item in tqdm(test_dataset):
        ffs = item["faces_features"].to(device)
        auth = item["authenticity"]

        _, output = trained_model(ffs.unsqueeze(dim=0))
        prediction = torch.argmax(output, dim=1)
        predictions.append(prediction.item())
        auths.append(auth.item())
    print(predictions)
    print(auths)
    print(classification_report(auths, predictions, target_names=CLASSES_STRS))

    cm = confusion_matrix(auths, predictions)
    print(cm)
    cm_df = pd.DataFrame(cm, index=CLASSES_NAMES, columns=CLASSES_NAMES)

    show_conf_matrix(cm_df)
