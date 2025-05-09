<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class TestCancelAbandonedReservations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:cancel-abandoned {--minutes=15 : Minutes to consider for abandoned reservations}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test command to cancel abandoned reservations with a custom time parameter';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $minutes = $this->option('minutes');
        $this->info("Running test to cancel reservations abandoned for {$minutes} minutes...");

        // Call the actual command
        $this->info("Executing reservations:cancel-abandoned --minutes={$minutes}");
        $exitCode = Artisan::call('reservations:cancel-abandoned', [
            '--minutes' => $minutes
        ]);

        $output = Artisan::output();
        $this->line($output);

        $this->info("Command completed with exit code: {$exitCode}");

        return $exitCode;
    }
}
