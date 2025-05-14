while ($true) {
    Write-Host "Running cancel-abandoned command..."
    php artisan reservations:cancel-abandoned
    Write-Host "Waiting 2 minutes..."
    Start-Sleep -Seconds 120
}
// This script runs the `php artisan reservations:cancel-abandoned` command every 60 seconds.
// 5min = 300 seconds 3 = 180
