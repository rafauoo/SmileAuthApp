import torch
import torch.nn as nn
import torch.optim as optim
import pytorch_lightning as pl
from torchmetrics.functional import accuracy
from model.config import LSTM_config as lstm_conf


class FacesFeaturesLSTM(nn.Module):
    def __init__(
        self,
        num_features: int,
        num_classes: int,
        num_hidden: int = lstm_conf.num_hidden,
        num_lstm_layers: int = lstm_conf.num_lstm_layers,
    ):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size=num_features,
            hidden_size=num_hidden,  # number of neurons in each layer
            num_layers=num_lstm_layers,
            batch_first=True,
            dropout=lstm_conf.dropout,
        )
        self.classifier = nn.Linear(num_hidden, num_classes)

    def forward(self, x):
        """Forward step.

        :param x: input data
        :return: model output
        """
        try:
            # self.lstm.flatten_parameters()  # for multi-GPU purposes
            lstm_out, (hidden, _) = self.lstm(x)
            if lstm_out.dim() == 2:
                lstm_out = lstm_out.unsqueeze(1)
            lstm_out = lstm_out[:, -1, :]
            output = self.classifier(lstm_out)
            return output
        except Exception as e:
            print(f"Error in forward pass: {e}")
            raise


class SmileAuthenticityPredictor(pl.LightningModule):
    def __init__(self, num_features: int, num_classes: int):
        super().__init__()
        self.model = FacesFeaturesLSTM(
            num_features=num_features, num_classes=num_classes
        )
        self.loss_func = nn.CrossEntropyLoss()

    def forward(self, x, auths=None):
        try:
            output = self.model(x)
            loss = 0
            if auths is not None:
                loss = self.loss_func(output, auths)
            return loss, output
        except Exception as e:
            print(f"Error in forward: {e}")
            raise

    def training_step(self, batch, batch_idx):
        try:
            faces_features = batch["faces_features"]
            authenticities = batch["authenticity"]

            loss, outputs = self(faces_features, authenticities)
            predictions = torch.argmax(outputs, dim=1)

            acc = accuracy(predictions, authenticities, task="binary")

            self.log("train_loss", loss, prog_bar=True, logger=True)
            self.log("train_accuracy", acc, prog_bar=True, logger=True)

            return {"loss": loss, "accuracy": acc}
        except Exception as e:
            print(f"Error in training_step: {e}")
            raise

    def validation_step(self, batch, batch_idx):
        try:
            faces_features = batch["faces_features"]
            authenticities = batch["authenticity"]

            loss, outputs = self(faces_features, authenticities)
            predictions = torch.argmax(outputs, dim=1)
            acc = accuracy(predictions, authenticities, task="binary")

            self.log("val_loss", loss, prog_bar=True, logger=True)
            self.log("val_accuracy", acc, prog_bar=True, logger=True)

            return {"loss": loss, "accuracy": acc}
        except Exception as e:
            print(f"Error in validation_step: {e}")
            raise

    def test_step(self, batch, batch_idx):
        try:
            faces_features = batch["faces_features"]
            authenticities = batch["authenticity"]
            print(f"Original tensor shape: {faces_features.shape}")
            loss, outputs = self(faces_features, authenticities)
            predictions = torch.argmax(outputs, dim=1)
            acc = accuracy(predictions, authenticities, task="binary")

            self.log("test_loss", loss, prog_bar=True, logger=True)
            self.log("test_accuracy", acc, prog_bar=True, logger=True)

            return {"loss": loss, "accuracy": acc}
        except Exception as e:
            print(f"Error in test_step: {e}")
            raise

    def configure_optimizers(self):
        try:
            return optim.Adam(self.parameters(), lr=lstm_conf.learning_rate)
        except Exception as e:
            print(f"Error in configure_optimizers: {e}")
            raise
