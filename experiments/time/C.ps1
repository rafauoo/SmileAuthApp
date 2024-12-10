param (
    [int]$number
)
Set-Location "C:\Users\Rafal\Desktop\SmileAuthApp"
.\experiments\time\clear.ps1 $number
conda activate SSNE
Set-Location "C:\Users\Rafal\Desktop\SmileAuthApp"
Measure-Command -Expression {
    python -m experiments.time_c --range $number
}