<?php

namespace App\Console\Commands;

use App\Models\Reservation;
use App\Models\Seat;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CancelAbandonedReservations extends Command
{
    //the command to check for abandoned reservations
    //and cancel them if they are older than the specified time
    protected $signature = 'reservations:cancel-abandoned {--minutes= : Minutes after which pending reservations are considered abandoned}';


   // a description of the command
    protected $description = 'Cancel abandoned pending reservations';

    /**
     * Execute the console command. every 5 minutes you can set the time in the karnel.php file
     */
    public function handle()
    {
        $minutes = $this->option('minutes')?? config('app.reservation_timeout');// default to the reservation timeout in the config file
        $cutoffTime = Carbon::now()->subMinutes($minutes);

        $this->info("Checking for reservations abandoned before {$cutoffTime}...");

        // Find pending reservations older than the cutoff time
        $abandonedReservations = Reservation::where('status', 'pending')
            ->where('created_at', '<', $cutoffTime)
            ->with('reservationSeats')
            ->get();

        $count = $abandonedReservations->count();
        $this->info("Found {$count} abandoned reservations.");

        if ($count === 0) {
            return;
        }

        // Process each abandoned reservation
        foreach ($abandonedReservations as $reservation) {
            $this->info("Processing reservation #{$reservation->id}...");

            // Update reservation status
            $reservation->update(['status' => 'cancelled']);

            // Release the seats
            $seatIds = $reservation->reservationSeats->pluck('seat_id');
            $seatsUpdated = Seat::whereIn('id', $seatIds)->update(['status' => 'available']);

            $this->info("- Updated {$seatsUpdated} seats to available");

            // Log the cancellation
            Log::info("Automatically cancelled abandoned reservation", [
                'reservation_id' => $reservation->id,
                'created_at' => $reservation->created_at,
                'seats_released' => $seatsUpdated,
                'user_id' => $reservation->user_id,
                'guest_email' => $reservation->guest_email
            ]);
        }

        $this->info("Successfully processed {$count} abandoned reservations.");
    }
}
