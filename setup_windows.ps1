$ErrorActionPreference = "Stop"

Write-Host "Downloading Python 3.11 installer..."
$pythonInstallerPath = "$env:TEMP\python_installer.exe"
Invoke-WebRequest -Uri "https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe" -OutFile $pythonInstallerPath

Write-Host "Installing Python 3.11..."
Start-Process -FilePath $pythonInstallerPath -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1" -Wait
Remove-Item $pythonInstallerPath

Write-Host "Downloading FFmpeg..."
$ffmpegZipPath = "$env:TEMP\ffmpeg.zip"
$ffmpegExtractPath = "C:\ffmpeg"
Invoke-WebRequest -Uri "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip" -OutFile $ffmpegZipPath

Write-Host "Extracting FFmpeg..."
Expand-Archive -Path $ffmpegZipPath -DestinationPath $ffmpegExtractPath -Force
$ffmpegFolder = Get-ChildItem $ffmpegExtractPath | Select-Object -First 1
$ffmpegBin = Join-Path $ffmpegFolder.FullName "bin"

Write-Host "Adding FFmpeg to Machine PATH..."
$oldPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
if ($oldPath -notlike "*$ffmpegBin*") {
    [Environment]::SetEnvironmentVariable("Path", "$oldPath;$ffmpegBin", "Machine")
}
Remove-Item $ffmpegZipPath

Write-Host "Python and FFmpeg installed. Please close and reopen the terminal to refresh PATH before running setup.bat"
