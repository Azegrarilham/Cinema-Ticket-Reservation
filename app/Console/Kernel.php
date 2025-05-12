<?php

namespace App\Console;

use App\Console\Commands\RepairScreeningSeats;
use App\Console\Commands\RepairReservationSeats;
use App\Console\Commands\ListTables;
use App\Console\Commands\OptimizeSqliteDatabase;
use App\Console\Commands\CreateAdminUser;
use App\Console\Commands\UpdateReservationConfirmationCodes;
use App\Console\Commands\CancelAbandonedReservations;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        RepairScreeningSeats::class,
        RepairReservationSeats::class,
        ListTables::class,
        OptimizeSqliteDatabase::class,
        CreateAdminUser::class,
        UpdateReservationConfirmationCodes::class,
        Commands\KafkaConsumerCommand::class,
        Commands\StartKafkaConsumers::class,
        Commands\TestKafkaPublish::class,
        CancelAbandonedReservations::class,
    ];

    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Schedule the command to run every 5 minutes
        $schedule->command('reservations:cancel-abandoned')->everyFiveMinutes();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
