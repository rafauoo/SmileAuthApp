param (
    [int]$number
)
Set-Location "C:\Users\Rafal\Desktop\SmileAuthApp"
.\experiments\time\clear.ps1 $number
conda activate SSNE
Set-Location "C:\Users\Rafal\Desktop\SmileAuthApp"
Measure-Command -Expression {
    python -m DataScripts.original_scripts.script_A
    python -m DataScripts.original_scripts.script_B
    python -m DataScripts.original_scripts.script_C
    python -m DataScripts.original_scripts.script_D
    python -m DataScripts.original_scripts.script_D2
    python -m DataScripts.original_scripts.script_E
    python -m DataScripts.original_scripts.script_E2
}