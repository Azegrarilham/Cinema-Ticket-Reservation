<?php

namespace App\Console\Commands;

use App\Models\Reservation;
use App\Models\ReservationSeat;
use App\Models\Seat;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RepairReservationSeats extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:repair-reservation-seats {reservation? : The ID of the specific reservation to repair} {--force : Force repair even if seats already exist}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Repairs missing reservation seats by linking reserved seats to their reservations';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $reservationId = $this->argument('reservation');
        $force = $this->option('force');

        if ($reservationId) {
            // Repair a specific reservation
            $reservation = Reservation::find($reservationId);

            if (!$reservation) {
                $this->error("Reservation #{$reservationId} not found!");
                return 1;
            }

            $this->repairReservation($reservation, $force);

        } else {
            // Repair all reservations with issues
            $query = Reservation::query();

            if (!$force) {
                // Only target reservations without seats (unless --force is used)
                $query->whereDoesntHave('reservationSeats');
            }

            $reservations = $query->get();

            $this->info("Found {$reservations->count()} reservations to check.");

            $progressBar = $this->output->createProgressBar($reservations->count());
            $progressBar->start();

            $fixed = 0;

            foreach ($reservations as $reservation) {
                $result = $this->repairReservation($reservation, $force);
                if ($result) {
                    $fixed++;
                }
                $progressBar->advance();
            }

            $progressBar->finish();
            $this->newLine(2);

            $this->info("Repair process completed. Fixed {$fixed} reservations.");
        }

        return 0;
    }

    /**
     * Repair a single reservation
     */
    protected function repairReservation(Reservation $reservation, bool $force = false): bool
    {
        $this->info("Checking reservation #{$reservation->id}...");

        // Skip if the reservation already has seats and we're not forcing
        if (!$force && $reservation->reservationSeats()->count() > 0) {
            $this->info("  - Reservation #{$reservation->id} already has seats. Skipping.");
            return false;
        }

        // Load the screening relationship if not already loaded
        if (!$reservation->relationLoaded('screening')) {
            $reservation->load('screening');
        }

        // Can't proceed without a screening
        if (!$reservation->screening) {
            $this->warn("  - Reservation #{$reservation->id} has no screening. Can't repair.");
            return false;
        }

        // Find potential seats to link
        $potentialSeats = Seat::where('screening_id', $reservation->screening_id)
            ->where('status', 'reserved')
            ->whereDoesntHave('reservationSeat')
            ->get();

        if ($potentialSeats->isEmpty()) {
            $this->warn("  - No available reserved seats found for reservation #{$reservation->id}.");
            return false;
        }

        $this->info("  - Found {$potentialSeats->count()} potential seats to link to reservation #{$reservation->id}.");

        $linkedCount = 0;

        // Start a database transaction
        DB::beginTransaction();

        try {
            foreach ($potentialSeats as $seat) {
                $reservationSeat = new ReservationSeat([
                    'reservation_id' => $reservation->id,
                    'seat_id' => $seat->id,
                    'price' => $reservation->screening->price,
                ]);

                $reservationSeat->save();
                $linkedCount++;

                $this->info("  - Linked seat {$seat->row}-{$seat->number} to reservation #{$reservation->id}");
            }

            DB::commit();
            $this->info("  - Successfully linked {$linkedCount} seats to reservation #{$reservation->id}.");
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("  - Failed to link seats to reservation #{$reservation->id}: " . $e->getMessage());
            return false;
        }
    }
}
