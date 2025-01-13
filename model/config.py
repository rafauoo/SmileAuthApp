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
        "num_epochs": 3000,
        'batch_size': 64,
        'num_hidden': 512,
        'num_lstm_layers': 2,
        'dropout': 0.35,
        'learning_rate': 0.0005
    }
)

CSV_METRICS_PATH = "epoch_metrics_29prim.csv"

"""
TRAIN/TEST CONFIG
"""

TRAIN_CKPT_PATH = "./model/checkpoints/best-checkpoint-v38.ckpt"
TRAIN_CSV_DIR = "out"

TEST_CKPT_PATH = "./model/checkpoints/best-checkpoint-v38.ckpt"
TEST_CSV_DIR = "out"
