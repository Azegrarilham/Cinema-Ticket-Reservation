<?php

namespace App\Console\Commands;

use App\Models\Screening;
use App\Models\Seat;
use Illuminate\Console\Command;

class RepairScreeningSeats extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'screenings:repair-seats {--screening_id= : Repair a specific screening ID}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Repair screenings with missing seat allocations';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $screeningId = $this->option('screening_id');

        if ($screeningId) {
            $screenings = Screening::where('id', $screeningId)->get();
            $this->info("Checking screening #{$screeningId}...");
        } else {
            $screenings = Screening::all();
            $this->info("Checking all screenings...");
        }

        $totalFixed = 0;

        foreach ($screenings as $screening) {
            $seatsCount = $screening->seats()->count();

            if ($seatsCount === 0) {
                $this->warn("Screening #{$screening->id} has no seats associated.");

                if ($this->confirm("Would you like to repair screening #{$screening->id}?")) {
                    $this->repairScreeningSeats($screening);
                    $totalFixed++;
                }
            } else if ($seatsCount !== $screening->total_seats) {
                $this->warn("Screening #{$screening->id} has {$seatsCount} seats but should have {$screening->total_seats}.");

                if ($this->confirm("Would you like to repair screening #{$screening->id}?")) {
                    // First delete existing seats to avoid duplicates
                    $screening->seats()->delete();
                    $this->repairScreeningSeats($screening);
                    $totalFixed++;
                }
            } else {
                $availableSeats = $screening->seats()->where('status', 'available')->count();
                $this->info("Screening #{$screening->id} has {$availableSeats}/{$screening->total_seats} available seats.");
            }
        }

        $this->info("Repair completed. Fixed {$totalFixed} screenings.");

        return Command::SUCCESS;
    }

    /**
     * Create seat allocations for a screening.
     */
    private function repairScreeningSeats(Screening $screening)
    {
        $this->info("Repairing seats for screening #{$screening->id}...");

        // Default layout - create 10 rows (A-J) with seats per row calculated from total seats
        $rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        $seatsPerRow = ceil($screening->total_seats / count($rows));

        $seatsCreated = 0;

        foreach ($rows as $row) {
            $seatsToCreate = min($seatsPerRow, $screening->total_seats - $seatsCreated);

            if ($seatsToCreate <= 0) {
                break;
            }

            for ($number = 1; $number <= $seatsToCreate; $number++) {
                Seat::create([
                    'screening_id' => $screening->id,
                    'row' => $row,
                    'number' => $number,
                    'status' => 'available',
                ]);
                $seatsCreated++;
            }

            if ($seatsCreated >= $screening->total_seats) {
                break;
            }
        }

        $this->info("Created {$seatsCreated} seats for screening #{$screening->id}");
    }
}
