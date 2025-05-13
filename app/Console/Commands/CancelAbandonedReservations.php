<?php

namespace App\Console\Commands;

use App\Models\Reservation;
use App\Models\Seat;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CancelAbandonedReservations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reservations:cancel-abandoned {--minutes= : Minutes after which pending reservations are considered abandoned}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cancel abandoned pending reservations';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $minutes = $this->option('minutes') ?? config('app.reservation_timeout');
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

            // Get seat IDs before deleting reservation seats
            $seatIds = $reservation->reservationSeats->pluck('seat_id');

            // Delete all reservation seats
            $reservation->reservationSeats()->delete();

            // Update seat status to available
            $seatsUpdated = Seat::whereIn('id', $seatIds)->update(['status' => 'available']);

            // Update reservation status
            $reservation->update(['status' => 'cancelled']);

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
