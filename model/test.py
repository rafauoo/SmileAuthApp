from model.lstm import SmileAuthenticityPredictor
from model.data import load_data_from_csv
from model.utils import get_trainer
from model.predictions import review_predictions
from model.dataloader import FacesFeaturesDataModule
from model.config import TEST_CKPT_PATH, TEST_CSV_DIR


def test():
    """Test model on whole data.

    Config TEST_CKPT_PATH in model.model_config to choose model checkpoint path.

    Config TEST_CSV_DIR in model.model_config to choose data directory.
    """
    try:
        csv_directory = TEST_CSV_DIR
        data = load_data_from_csv(csv_directory)
        train_data = data
        test_data = data
        batch_size = 64
        data_module = FacesFeaturesDataModule(
            train_data, test_data, batch_size=batch_size
        )
        data_module.setup()
        trainer = get_trainer()
        model = SmileAuthenticityPredictor(num_classes=2, num_features=39)
        trainer.test(
            model=model,
            datamodule=data_module,
            ckpt_path=TEST_CKPT_PATH,
        )
        review_predictions(
            test_data=test_data,
            ckpt_path=TEST_CKPT_PATH,
        )
    except Exception as e:
        print(f"Error during training: {e}")
        raise


if __name__ == "__main__":
    test()
