param (
    [int]$number
)

Write-Output "=========================="
Write-Output "EXPERIMENT 0"
Set-Location "C:\Users\Rafal\Desktop\SmileAuthApp" > $null
.\experiments\time\clear.ps1 $number > $null
conda activate SSNE > $null
Set-Location "C:\Users\Rafal\Desktop\SmileAuthApp" > $null
Measure-Command -Expression {
    python -m DataScripts.original_scripts.script_A
    python -m DataScripts.original_scripts.script_B
    python -m DataScripts.original_scripts.script_C
    python -m DataScripts.original_scripts.script_D
    python -m DataScripts.original_scripts.script_D2
    python -m DataScripts.original_scripts.script_E
    python -m DataScripts.original_scripts.script_E2
}
Write-Output "=========================="


Write-Output "=========================="
Write-Output "EXPERIMENT A"
Set-Location "C:\Users\Rafal\Desktop\SmileAuthApp" > $null
.\experiments\time\clear.ps1 $number > $null
conda activate SSNE > $null
Set-Location "C:\Users\Rafal\Desktop\SmileAuthApp" > $null
Measure-Command -Expression {
    python -m experiments.time_a --range $number
}
Write-Output "=========================="


Write-Output "=========================="
Write-Output "EXPERIMENT B"
Set-Location "C:\Users\Rafal\Desktop\SmileAuthApp" > $null
.\experiments\time\clear.ps1 $number > $null
conda activate SSNE > $null
Set-Location "C:\Users\Rafal\Desktop\SmileAuthApp" > $null
Measure-Command -Expression {
    python -m experiments.time_b --range $number
}
Write-Output "=========================="


Write-Output "=========================="
Write-Output "EXPERIMENT C"
Set-Location "C:\Users\Rafal\Desktop\SmileAuthApp" > $null
.\experiments\time\clear.ps1 $number > $null
conda activate SSNE > $null
Set-Location "C:\Users\Rafal\Desktop\SmileAuthApp" > $null
Measure-Command -Expression {
    python -m experiments.time_c --range $number
}
Write-Output "=========================="


Write-Output "=========================="
Write-Output "EXPERIMENT D"
Set-Location "C:\Users\Rafal\Desktop\SmileAuthApp" > $null
.\experiments\time\clear.ps1 $number > $null
conda activate SSNE > $null
Set-Location "C:\Users\Rafal\Desktop\SmileAuthApp" > $null
Measure-Command -Expression {
    python -m experiments.time_d
}
Write-Output "=========================="