from unittest import mock
from DataScripts.scripts.c_detect_smiles import show_smile_plot


@mock.patch("matplotlib.pyplot.show")
@mock.patch("matplotlib.pyplot.plot")
def test_show_smile_plot(mock_plot, mock_show):
    mock_data = [
        {"frame": 1, "diff": 0.1},
        {"frame": 2, "diff": 0.5},
        {"frame": 3, "diff": 0.3},
    ]
    show_smile_plot(mock_data)
    frames = [1, 2, 3]
    diffs = [0.1, 0.5, 0.3]
    mock_plot.assert_called_with(frames, diffs, "-o")
    mock_show.assert_called_once()
