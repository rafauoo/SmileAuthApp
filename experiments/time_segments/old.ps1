param (
    [int]$number
)
Set-Location "C:\Users\Rafal\Desktop\SmileAuthApp"
.\experiments\time\clear.ps1 $number
conda activate SSNE
Set-Location "C:\Users\Rafal\Desktop\SmileAuthApp"
Write-Output "A"
Measure-Command -Expression {
    python -m DataScripts.original_scripts.script_A
}
Write-Output "B"
Measure-Command -Expression {
    python -m DataScripts.original_scripts.script_B
}
Write-Output "C"
Measure-Command -Expression {
    python -m DataScripts.original_scripts.script_C
}
Write-Output "D"
Measure-Command -Expression {
    python -m DataScripts.original_scripts.script_D
    python -m DataScripts.original_scripts.script_D2
}
Write-Output "E"
Measure-Command -Expression {
    python -m DataScripts.original_scripts.script_E
    python -m DataScripts.original_scripts.script_E2
}
