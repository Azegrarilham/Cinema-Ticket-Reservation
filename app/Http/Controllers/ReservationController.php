<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Reservation;
use App\Models\ReservationSeat;
use App\Models\Screening;
use App\Models\Seat;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Notifications\TicketConfirmationNotification;
use Illuminate\Support\Facades\Notification;

class ReservationController extends Controller
{
    /**
     * Display the seat selection page for a screening.
     */
    public function seatSelection(Screening $screening)
    {
        $screening->load(['film', 'seats']);

        // Group seats by row for better UI display
        $seatsByRow = $screening->seats->groupBy('row')->toArray();

        return Inertia::render('Client/Reservations/SeatSelection', [
            'screening' => $screening,
            'seatsByRow' => $seatsByRow,
        ]);
    }

    /**
     * Store a new reservation.
     */
    public function store(Request $request, Screening $screening)
    {
        $validationRules = [
            'seat_ids' => 'required|array|min:1',
            'seat_ids.*' => 'required|exists:seats,id',
            'guest_phone' => 'nullable|string|max:20',
        ];

        // Only require guest name and email for non-authenticated users
        if (!Auth::check()) {
            $validationRules['guest_name'] = 'required|string|max:255';
            $validationRules['guest_email'] = 'required|email|max:255';
        } else {
            $validationRules['guest_name'] = 'nullable|string|max:255';
            $validationRules['guest_email'] = 'nullable|email|max:255';
        }

        $validated = $request->validate($validationRules);

        // Check if seats are available
        $seats = Seat::whereIn('id', $validated['seat_ids'])
            ->where('screening_id', $screening->id)
            ->get();

        if ($seats->count() !== count($validated['seat_ids']) ||
            $seats->contains('status', '!=', 'available')) {
            return back()->with('error', 'Some selected seats are no longer available.');
        }

        // Create reservation
        $reservation = Reservation::create([
            'screening_id' => $screening->id,
            'user_id' => Auth::check() ? Auth::id() : null,
            'guest_name' => Auth::check() ? null : ($validated['guest_name'] ?? null),
            'guest_email' => Auth::check() ? null : ($validated['guest_email'] ?? null),
            'guest_phone' => $validated['guest_phone'] ?? null,
            'status' => 'pending',
        ]);

        // Create reservation seats and update seat status
        foreach ($seats as $seat) {
            ReservationSeat::create([
                'reservation_id' => $reservation->id,
                'seat_id' => $seat->id,
                'price' => $screening->price,
            ]);

            $seat->update(['status' => 'reserved']);
        }

        // Load reservationSeats and user for payment page
        $reservation->load(['screening.film', 'reservationSeats.seat', 'user']);

        // Calculate the total price based on reservation seats
        $totalPrice = $reservation->reservationSeats->sum('price');
        $reservation->total_price = $totalPrice;

        return redirect()->route('reservations.payment', $reservation);
    }

    /**
     * Display payment page for a reservation.
     */
    public function payment(Reservation $reservation)
    {
        if ($reservation->status !== 'pending') {
            return redirect()->route('films.index')
                ->with('error', 'This reservation cannot be processed.');
        }

        $reservation->load(['screening.film', 'reservationSeats.seat', 'user']);

        // Calculate the total price based on reservation seats
        $totalPrice = $reservation->reservationSeats->sum('price');
        $reservation->total_price = $totalPrice;

        return Inertia::render('Client/Reservations/Payment', [
            'reservation' => $reservation,
        ]);
    }

    /**
     * Process payment for a reservation.
     */
    public function processPayment(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'payment_method' => 'required|string|in:credit_card,paypal',
            // Additional payment fields would go here in a real implementation
        ]);

        // In a real app, you would integrate with a payment gateway here
        // For this demo, we'll just mark the payment as completed

        // Create payment record
        $payment = Payment::create([
            'reservation_id' => $reservation->id,
            'amount' => $reservation->total_price,
            'status' => 'completed',
            'payment_method' => $validated['payment_method'],
            'transaction_id' => Str::random(10),
        ]);

        // Update reservation and seat status
        $reservation->update(['status' => 'confirmed']);

        $seatIds = $reservation->reservationSeats->pluck('seat_id');
        Seat::whereIn('id', $seatIds)->update(['status' => 'sold']);

        // Send ticket confirmation email
        $this->sendTicketConfirmationEmail($reservation);

        return redirect()->route('reservations.confirmation', $reservation);
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
     * Display confirmation page after successful payment.
     */
    public function confirmation(Reservation $reservation)
    {
        $reservation->load(['screening.film', 'reservationSeats.seat', 'payment', 'user']);

        // Prepare seats data to match the expected structure in the Confirmation component
        $seats = $reservation->reservationSeats->map(function ($reservationSeat) {
            return $reservationSeat->seat;
        });

        // Add seats to the reservation data
        $reservation->seats = $seats;

        // Calculate the total price explicitly
        $totalPrice = $reservation->reservationSeats->sum('price');
        $reservation->total_price = $totalPrice ?: ($seats->count() * $reservation->screening->price);

        // Set payment status
        $reservation->payment_status = $reservation->payment ? $reservation->payment->status : 'pending';

        return Inertia::render('Client/Reservations/Confirmation', [
            'reservation' => $reservation,
        ]);
    }

    /**
     * Display user's reservation history.
     */
    public function userReservations()
    {
        $reservations = Auth::user()->reservations()
            ->with(['screening.film', 'payment', 'reservationSeats'])
            ->orderByDesc('created_at')
            ->get();

        // Format reservations for frontend display
        $reservations->each(function ($reservation) {
            // Calculate total price if not set
            if (!$reservation->payment) {
                $totalPrice = $reservation->reservationSeats->sum('price');
                $reservation->total_price = $totalPrice ?: 0;
            }

            // Map seats data
            $seats = $reservation->reservationSeats->map(function ($reservationSeat) {
                return $reservationSeat->seat;
            });
            $reservation->seats_count = $seats->count();
        });

        return Inertia::render('Client/Account/Reservations', [
            'reservations' => $reservations,
            'user' => Auth::user(),
        ]);
    }

    /**
     * Display specific reservation details.
     */
    public function show(Reservation $reservation)
    {
        if (Auth::id() !== $reservation->user_id) {
            abort(403);
        }

        try {
            $reservation->load(['screening.film', 'reservationSeats.seat', 'payment', 'user']);

            // Prepare seats data to match the expected structure in the component
            $seats = collect();

            if ($reservation->relationLoaded('reservationSeats') && $reservation->reservationSeats->isNotEmpty()) {
                $seats = $reservation->reservationSeats->map(function ($reservationSeat) {
                    return $reservationSeat->seat;
                })->filter(); // Filter out any null seats
            }

            // Add seats to the reservation data
            $reservation->seats = $seats;

            // Calculate the total price explicitly
            $totalPrice = $reservation->reservationSeats->sum('price');
            $reservation->total_price = $totalPrice ?: ($seats->count() * ($reservation->screening->price ?? 0));

            // Set payment status
            $reservation->payment_status = $reservation->payment ? $reservation->payment->status : 'pending';

            return Inertia::render('Client/Account/ReservationDetails', [
                'reservation' => $reservation,
                'user' => Auth::user(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Error loading reservation details: ' . $e->getMessage(), [
                'reservation_id' => $reservation->id,
                'user_id' => Auth::id(),
                'stack' => $e->getTraceAsString()
            ]);

            return redirect()->route('account.reservations')
                ->with('error', 'Could not load reservation details. Please try again later.');
        }
    }

    /**
     * Display the reservation search form.
     */
    public function searchForm()
    {
        return Inertia::render('Client/Reservations/Search');
    }

    /**
     * Search for a reservation by confirmation code.
     */
    public function search(Request $request)
    {
        $request->validate([
            'confirmation_code' => 'required|string|min:5',
        ]);

        $code = $request->input('confirmation_code');

        // Try to find by confirmation_code (preferred) or reservation_code
        $reservation = Reservation::where('confirmation_code', $code)
            ->orWhere('reservation_code', $code)
            ->with(['screening.film', 'reservationSeats.seat', 'payment'])
            ->first();

        if (!$reservation) {
            return back()->withErrors([
                'confirmation_code' => 'No reservation found with this confirmation code.',
            ]);
        }

        // Store the reservation ID in the session to grant permission for ticket download
        session()->put('found_reservation_' . $reservation->id, true);

        // Calculate the total price explicitly
        $totalPrice = $reservation->reservationSeats->sum('price');
        $reservation->total_price = $totalPrice ?: ($reservation->reservationSeats->count() * $reservation->screening->price);

        // Map reservation seats to seats property
        $reservation->seats = $reservation->reservationSeats->map(function ($reservationSeat) {
            return $reservationSeat->seat;
        });

        // Set payment status
        $reservation->payment_status = $reservation->payment ? $reservation->payment->status : 'pending';

        return Inertia::render('Client/Reservations/SearchResult', [
            'reservation' => $reservation,
        ]);
    }

    /**
     * Download a PDF ticket for a reservation.
     */
    public function downloadTicket(Reservation $reservation)
    {
        // Make sure the user can only download their own reservations, guest reservations they created,
        // or reservations they found via search
        if (Auth::check() && Auth::id() !== $reservation->user_id &&
            !session()->has('guest_reservation_' . $reservation->id) &&
            !session()->has('found_reservation_' . $reservation->id)) {
            abort(403);
        }

        $reservation->load(['screening.film', 'reservationSeats.seat', 'payment', 'user']);

        // Prepare seats data
        $seats = $reservation->reservationSeats->map(function ($reservationSeat) {
            return $reservationSeat->seat;
        });
        $reservation->seats = $seats;

        // Format seat numbers for display
        $seatsList = $seats->sortBy(function ($seat) {
            return $seat->row . str_pad($seat->number, 3, '0', STR_PAD_LEFT);
        })->map(function ($seat) {
            return $seat->row . $seat->number;
        })->implode(', ');

        // Get user information
        $userName = null;
        $userEmail = null;

        if ($reservation->user) {
            $userName = $reservation->user->name;
            $userEmail = $reservation->user->email;
        } else {
            $userName = $reservation->guest_name;
            $userEmail = $reservation->guest_email;
        }

        // Generate PDF
        $pdf = Pdf::loadView('tickets.download', [
            'reservation' => $reservation,
            'seatsList' => $seatsList,
            'userName' => $userName,
            'userEmail' => $userEmail,
        ]);

        // Stream the PDF directly to the browser without Inertia/Axios
        return $pdf->stream('ticket-' . $reservation->confirmation_code . '.pdf');
    }
}
