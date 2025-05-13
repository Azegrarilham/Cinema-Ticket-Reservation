while ($true) {
    Write-Host "Running cancel-abandoned command..."
    php artisan reservations:cancel-abandoned
    Write-Host "Waiting 60 seconds..."
    Start-Sleep -Seconds 60
}
