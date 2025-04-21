<?php

namespace App\Console\Commands;

use App\Models\Reservation;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class UpdateReservationConfirmationCodes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reservations:update-codes';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update confirmation codes for existing reservations';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Updating confirmation codes for reservations...');

        $reservations = Reservation::whereNull('confirmation_code')->get();
        $count = $reservations->count();

        $this->info("Found {$count} reservations without confirmation codes.");

        if ($count === 0) {
            $this->info('No reservations to update.');
            return;
        }

        $bar = $this->output->createProgressBar($count);
        $bar->start();

        foreach ($reservations as $reservation) {
            $reservation->confirmation_code = 'CONF-' . strtoupper(Str::random(8));
            $reservation->save();
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Confirmation codes updated successfully.');
    }
}
