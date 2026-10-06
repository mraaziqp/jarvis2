# Quick Push Helper Script for Jarvis v2.5
param(
    [string]$GitHubToken
)

$env:Path = "C:\Users\G997629\MinGit\cmd;$env:Path"

if ($GitHubToken) {
    git remote set-url origin "https://${GitHubToken}@github.com/mraaziqp/Second-Brain.git"
    git push -u origin main
    git remote set-url origin "https://github.com/mraaziqp/Second-Brain.git" # Reset to clean URL
    Write-Host "Successfully pushed Jarvis v2.5 to GitHub!" -ForegroundColor Green
} else {
    Write-Host "Pushing with interactive authentication..." -ForegroundColor Cyan
    git push -u origin main
}
