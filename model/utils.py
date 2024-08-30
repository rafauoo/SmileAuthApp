from pytorch_lightning.callbacks import ModelCheckpoint
from pytorch_lightning.loggers import TensorBoardLogger
from pytorch_lightning import Trainer
from pytorch_lightning.callbacks import RichProgressBar
from model.model_config import LSTM_config as lstm_conf
import os
def get_trainer():
    try:
        logger = TensorBoardLogger('lightning_logs', name='authenticity')

        checkpoint_callback = ModelCheckpoint(
            dirpath='checkpoints',
            filename='best-checkpoint',
            save_top_k=1,  # only the best model
            verbose=True,
            monitor='val_loss',
            mode='min'
        )

        # Dodaj RichProgressBar do callbacków
        progress_bar = RichProgressBar()

        trainer = Trainer(
            logger=logger,
            callbacks=[checkpoint_callback, progress_bar],  # Dodaj progress_bar do callbacków
            max_epochs=lstm_conf.num_epochs,
            accelerator='gpu',
            devices=1,
            log_every_n_steps=5,
        )
        return trainer
    except Exception as e:
        print(f"Error in get_trainer: {e}")
        raise
