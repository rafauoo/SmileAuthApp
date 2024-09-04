from dotmap import DotMap

"""
Use this file to configurate the model to your needs.
"""

COL_LEN = 39
CLASSES = [0, 1]
CLASSES_STRS = ["0", "1"]
CLASSES_NAMES = ["not authentic", "authentic"]

LSTM_config = DotMap(
    {
        "num_epochs": 2000,
        "batch_size": 32,
        "num_hidden": 512,
        "num_lstm_layers": 3,
        "dropout": 0.55,
        "learning_rate": 0.000096,
    }
)


"""
TRAIN/TEST CONFIG
"""

TRAIN_CKPT_PATH = "./model/checkpoints/best-checkpoint-v6.ckpt"
TRAIN_CSV_DIR = "DataScripts/outputs"

TEST_CKPT_PATH = "./model/checkpoints/best-checkpoint-v6.ckpt"
TEST_CSV_DIR = "DataScripts/outputs"
