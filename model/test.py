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

def test():
    try:
        csv_directory = 'DataScripts/outputs'
        data = load_data_from_csv(csv_directory)
        # Podział na zbiór treningowy i testowy
        train_data = data
        test_data = data
        batch_size = 32  # Przykładowa wielkość batcha
        data_module = FacesFeaturesDataModule(train_data, test_data, batch_size=batch_size)
        data_module.setup()
        trainer = get_trainer()
        model = SmileAuthenticityPredictor(num_classes=2, num_features=39)
        trainer.test(model=model, datamodule=data_module, ckpt_path="./checkpoints/best-checkpoint-v6.ckpt")
        review_predictions(trainer=trainer, test_data=test_data, ckpt_path="./checkpoints/best-checkpoint-v6.ckpt")
    except Exception as e:
        print(f"Error during training: {e}")
        raise


if __name__ == '__main__':
    test()

