<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Film;
use App\Models\Reservation;
use App\Models\Screening;
use App\Notifications\TicketConfirmationNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class ReservationController extends Controller
{
    /**
     * Display a listing of the reservations.
     */
    public function index(Request $request)
    {
        $reservations = Reservation::query()
            ->with(['screening.film', 'user', 'payment', 'reservationSeats'])
            ->withCount('reservationSeats as seats_count')
            ->when($request->film_id, function ($query, $filmId) {
                $query->whereHas('screening', function ($q) use ($filmId) {
                    $q->where('film_id', $filmId);
                });
            })
            ->when($request->screening_id, function ($query, $screeningId) {
                $query->where('screening_id', $screeningId);
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->date, function ($query, $date) {
                $query->whereHas('screening', function ($q) use ($date) {
                    $q->whereDate('start_time', $date);
                });
            })
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        // Calculate the total price for each reservation
        foreach ($reservations as $reservation) {
            $reservation->total_price = $reservation->reservationSeats->sum('price');
        }

        $films = Film::orderBy('title')->get(['id', 'title']);
        $screenings = [];

        if ($request->film_id) {
            $screenings = Screening::where('film_id', $request->film_id)
                ->whereDate('start_time', '>=', now()->subDays(30))
                ->orderBy('start_time')
                ->get(['id', 'start_time']);
        }

        return Inertia::render('Admin/Reservations/Index', [
            'reservations' => $reservations,
            'films' => $films,
            'screenings' => $screenings,
            'filters' => $request->only(['film_id', 'screening_id', 'status', 'date']),
            'statuses' => ['pending', 'confirmed', 'cancelled'],
        ]);
    }

    /**
     * Display the specified reservation.
     */
    public function show(Reservation $reservation)
    {
        // First, load the relations
        $reservation->load([
            'screening.film',
            'user',
            'payment',
            'reservationSeats.seat'
        ]);

        // Check if reservationSeats were properly loaded
        if ($reservation->reservationSeats->isEmpty()) {
            // If reservationSeats is empty, try to load them directly and check for database issues
            $directSeats = \App\Models\ReservationSeat::where('reservation_id', $reservation->id)->get();

            // Log what we found to help debugging
            \Illuminate\Support\Facades\Log::info('Reservation #' . $reservation->id . ' has empty reservationSeats relation', [
                'direct_seats_count' => $directSeats->count(),
                'reservation_id' => $reservation->id,
                'has_screening' => $reservation->screening ? 'yes' : 'no',
                'screening_id' => $reservation->screening_id,
            ]);

            // If there are actually seats in the database but they weren't loaded properly
            if ($directSeats->isNotEmpty()) {
                // Force load the seats
                $reservation->setRelation('reservationSeats', $directSeats->load('seat'));

                \Illuminate\Support\Facades\Log::info('Forced loading of seats for Reservation #' . $reservation->id, [
                    'loaded_count' => $directSeats->count(),
                ]);
            } else {
                // No reservationSeats found in the database
                // Let's try to find out if there are any seats for this screening that might be reserved
                if ($reservation->screening) {
                    $potentialSeats = \App\Models\Seat::where('screening_id', $reservation->screening_id)
                        ->where('status', 'reserved')
                        ->get();

                    \Illuminate\Support\Facades\Log::info('No reservationSeats found, checking for potential seats', [
                        'potential_seats_count' => $potentialSeats->count(),
                        'screening_id' => $reservation->screening_id
                    ]);

                    // If we found seats with "reserved" status, they might belong to this reservation
                    // but the reservation_seats records might be missing
                    if ($potentialSeats->isNotEmpty()) {
                        // Try to automatically repair the data
                        $this->repairReservationSeats($reservation, $potentialSeats);

                        // Reload the relationship after repair
                        $reservation->load('reservationSeats.seat');
                    }
                }
            }
        } else {
            \Illuminate\Support\Facades\Log::info('Reservation #' . $reservation->id . ' has reservationSeats loaded correctly', [
                'seats_count' => $reservation->reservationSeats->count()
            ]);
        }

        // Calculate the total price explicitly based on reservation seats
        $totalPrice = $reservation->reservationSeats->sum('price');

        // If there's no price set in the reservation seats, calculate based on the number of seats and screening price
        if ($totalPrice <= 0 && $reservation->reservationSeats->count() > 0) {
            $totalPrice = $reservation->reservationSeats->count() * $reservation->screening->price;
        } else if ($totalPrice <= 0 && $reservation->screening) {
            // If we have a total price from elsewhere (like from the payment), use that
            if ($reservation->payment && $reservation->payment->amount > 0) {
                $totalPrice = $reservation->payment->amount;
            } else {
                // Otherwise, use a placeholder based on a typical ticket price for UI display
                $totalPrice = $reservation->screening->price; // Just show the price of one ticket
            }

            \Illuminate\Support\Facades\Log::info('Using fallback price calculation for Reservation #' . $reservation->id, [
                'total_price' => $totalPrice,
                'reason' => 'No reservation seats with prices found'
            ]);
        }

        $reservation->total_price = $totalPrice;

        return Inertia::render('Admin/Reservations/Show', [
            'reservation' => $reservation,
        ]);
    }

    /**
     * Try to repair reservation seats data by connecting reserved seats to the reservation
     */
    protected function repairReservationSeats(Reservation $reservation, $potentialSeats)
    {
        \Illuminate\Support\Facades\Log::info('Attempting to repair reservation seats for Reservation #' . $reservation->id, [
            'seats_count' => $potentialSeats->count()
        ]);

        foreach ($potentialSeats as $seat) {
            // Check if this seat is already in another reservation to avoid conflicts
            $existingReservationSeat = \App\Models\ReservationSeat::where('seat_id', $seat->id)->first();

            if (!$existingReservationSeat) {
                // Create a new reservation seat record
                $reservationSeat = new \App\Models\ReservationSeat([
                    'reservation_id' => $reservation->id,
                    'seat_id' => $seat->id,
                    'price' => $reservation->screening->price, // Use the screening price
                ]);

                $reservationSeat->save();

                \Illuminate\Support\Facades\Log::info('Created missing reservation seat for Reservation #' . $reservation->id, [
                    'seat_id' => $seat->id,
                    'row' => $seat->row,
                    'number' => $seat->number
                ]);
            } else {
                \Illuminate\Support\Facades\Log::warning('Seat already belongs to another reservation', [
                    'seat_id' => $seat->id,
                    'reservation_id' => $existingReservationSeat->reservation_id
                ]);
            }
        }
    }

    /**
     * Update the status of the specified reservation.
     */
    public function updateStatus(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled',
        ]);

        $previousStatus = $reservation->status;

        $reservation->update([
            'status' => $validated['status'],
        ]);

        // If cancelled, update seat status back to available
        if ($validated['status'] === 'cancelled') {
            $seatIds = $reservation->reservationSeats->pluck('seat_id');

            \App\Models\Seat::whereIn('id', $seatIds)
                ->update(['status' => 'available']);
        }

        // If status changed to confirmed, send confirmation email with ticket
        if ($validated['status'] === 'confirmed' && $previousStatus !== 'confirmed') {
            $this->sendTicketConfirmationEmail($reservation);
        }

        return redirect()->route('admin.reservations.show', $reservation)
            ->with('success', 'Reservation status updated successfully.');
    }

    /**
     * Send ticket confirmation email to the customer.
     */
    protected function sendTicketConfirmationEmail(Reservation $reservation)
    {
        $reservation->load(['screening.film', 'reservationSeats.seat', 'user']);

        // For guest reservations, send to the guest email
        if ($reservation->guest_email) {
            Notification::route('mail', $reservation->guest_email)
                ->notify(new TicketConfirmationNotification($reservation));
        }
        // For logged-in users, use the notification system
        elseif ($reservation->user) {
            $reservation->user->notify(new TicketConfirmationNotification($reservation));
        }
    }

    /**
     * Remove the specified reservation from storage.
     */
    public function destroy(Reservation $reservation)
    {
        // Free up the seats
        $seatIds = $reservation->reservationSeats->pluck('seat_id');

        \App\Models\Seat::whereIn('id', $seatIds)
            ->update(['status' => 'available']);

        $reservation->delete();

        return redirect()->route('admin.reservations.index')
            ->with('success', 'Reservation deleted successfully.');
    }
}
