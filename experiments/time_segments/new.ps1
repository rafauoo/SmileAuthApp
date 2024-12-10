param (
    [int]$number
)
Set-Location "C:\Users\Rafal\Desktop\SmileAuthApp"
.\experiments\time\clear.ps1 $number
conda activate SSNE
Set-Location "C:\Users\Rafal\Desktop\SmileAuthApp"
python -m experiments.segments_new --range $number