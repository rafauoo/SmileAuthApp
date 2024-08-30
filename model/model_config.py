import sys
import os
from dotmap import DotMap

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# LSTM_config = DotMap({
#     'num_epochs': 300,
#     'batch_size': 64,
#     'num_hidden': 256,
#     'num_lstm_layers': 3,
#     'dropout': 0.75,
#     'learning_rate': 0.0001
# })

COL_LEN = 39
CLASSES = [0, 1]
CLASSES_STRS = ['0', '1']
CLASSES_NAMES = []
# LSTM_config = DotMap({
#     'num_epochs': 600,
#     'batch_size': 64,
#     'num_hidden': 512,
#     'num_lstm_layers': 3,
#     'dropout': 0.75,
#     'learning_rate': 0.00001
# })

LSTM_config = DotMap({
    'num_epochs': 2000,
    'batch_size': 16,
    'num_hidden': 512,
    'num_lstm_layers': 3,
    'dropout': 0.45,
    'learning_rate': 0.0004
})
