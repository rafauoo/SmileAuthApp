import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from model.model_lstm import SmileAuthenticityPredictor
from data import load_data_from_csv
from utils import get_trainer
from pytorch_lightning.callbacks import ModelCheckpoint
from predictions import review_predictions
from dataset_loader import FacesFeaturesDataModule
from sklearn.model_selection import train_test_split


def train():
    try:
        csv_directory = "DataScripts/outputs"
        data = load_data_from_csv(csv_directory)
        # Podział na zbiór treningowy i testowy
        train_data, test_data = train_test_split(data, test_size=0.3, random_state=694)
        batch_size = 32  # Przykładowa wielkość batcha
        data_module = FacesFeaturesDataModule(
            train_data, test_data, batch_size=batch_size
        )
        data_module.setup()
        # print(train_data[0][0])
        num_features = len(train_data[0][0])
        # print(num_features)
        num_classes = 2  # Autentyczny (1) lub nieautentyczny (0)
        # Konfiguracja trenera
        # model = SmileAuthenticityPredictor(num_classes=2, num_features=39)
        model = SmileAuthenticityPredictor.load_from_checkpoint(
            "./checkpoints/best-checkpoint-v6.ckpt", num_classes=2, num_features=39
        )
        # os.remove("./checkpoints/best-checkpoint.ckpt")
        trainer = get_trainer()
        trainer.fit(model, datamodule=data_module)
        trainer.test(datamodule=data_module, ckpt_path="best")

        review_predictions(trainer=trainer, test_data=test_data)
    except Exception as e:
        print(f"Error during training: {e}")
        raise


if __name__ == "__main__":
    train()
