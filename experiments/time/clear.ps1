param (
    [int]$number = 5
)


# Clear and recreate the directories
Remove-Item "backups\tmp" -Recurse -Force
Remove-Item "backups\videos" -Recurse -Force
mkdir "backups\tmp"
mkdir "backups\videos"

# Get the list of videos from the source directory
$org_videos = Get-ChildItem -Path "data\videos_new"

# Copy up to $number files from $org_videos
$index = 0
while ($number -gt 0 -and $index -lt $org_videos.Count) {
    Copy-Item -Path $org_videos[$index].FullName -Destination "backups\videos\$($org_videos[$index].Name)"
    $index += 1
    $number -= 1
}

# Retrieve the copied videos
$videos = Get-ChildItem -Path "backups\videos"

# Create numbered directories and copy each video with a new name
$num = 1
foreach ($video in $videos) {
    $destinationFolder = "backups\tmp\$num"
    mkdir $destinationFolder
    Copy-Item -Path $video.FullName -Destination "$destinationFolder\movie.mp4"
    $num += 1
}


conda activate SSNE
Remove-Item "experiments\0" -Recurse -Force
Remove-Item "experiments\d" -Recurse -Force
Remove-Item "DataScripts\tmp" -Recurse -Force
mkdir "experiments\0"
mkdir "experiments\d"
mkdir "experiments\d\out"
robocopy "backups\videos" "experiments\0\videos"
robocopy "backups\videos" "experiments\d\videos"
robocopy "backups\tmp" "DataScripts\tmp" /MIR