<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Film;
use App\Models\Screening;
use App\Models\Seat;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScreeningController extends Controller
{
    /**
     * Display a listing of the screenings.
     */
    public function index(Request $request)
    {
        $screenings = Screening::query()
            ->with('film')
            ->withCount(['seats as available_seats_count' => function ($query) {
                $query->where('status', 'available');
            }])
            ->when($request->film_id, function ($query, $filmId) {
                $query->where('film_id', $filmId);
            })
            ->when($request->date, function ($query, $date) {
                $query->whereDate('start_time', $date);
            })
            ->orderBy('start_time')
            ->paginate(10)
            ->withQueryString();

        $films = Film::orderBy('title')->get(['id', 'title']);

        return Inertia::render('Admin/Screenings/Index', [
            'screenings' => $screenings,
            'films' => $films,
            'filters' => $request->only(['film_id', 'date']),
        ]);
    }

    /**
     * Show the form for creating a new screening.
     */
    public function create()
    {
        $films = Film::orderBy('title')->get(['id', 'title', 'duration']);

        return Inertia::render('Admin/Screenings/Create', [
            'films' => $films,
        ]);
    }

    /**
     * Store a newly created screening in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'film_id' => 'required|exists:films,id',
            'start_time' => 'required|date|after:now',
            'room' => 'required|string|max:50',
            'total_seats' => 'required|integer|min:1|max:500',
            'price' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'seat_layout' => 'required|array',
            'seat_layout.rows' => 'required|array',
            'seat_layout.rows.*' => 'required|string',
            'seat_layout.seats_per_row' => 'required|integer|min:1',
        ]);

        $screening = Screening::create([
            'film_id' => $validated['film_id'],
            'start_time' => $validated['start_time'],
            'room' => $validated['room'],
            'total_seats' => $validated['total_seats'],
            'price' => $validated['price'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        // Create seats for the screening based on the layout
        foreach ($validated['seat_layout']['rows'] as $row) {
            for ($number = 1; $number <= $validated['seat_layout']['seats_per_row']; $number++) {
                Seat::create([
                    'screening_id' => $screening->id,
                    'row' => $row,
                    'number' => $number,
                    'status' => 'available',
                ]);
            }
        }

        return redirect()->route('admin.screenings.index')
            ->with('success', 'Screening created successfully.');
    }

    /**
     * Display the specified screening.
     */
    public function show(Screening $screening)
    {
        $screening->load(['film', 'seats', 'reservations.reservationSeats.seat']);

        return Inertia::render('Admin/Screenings/Show', [
            'screening' => $screening,
        ]);
    }

    /**
     * Show the form for editing the specified screening.
     */
    public function edit(Screening $screening)
    {
        $films = Film::orderBy('title')->get(['id', 'title', 'duration']);

        return Inertia::render('Admin/Screenings/Edit', [
            'screening' => $screening,
            'films' => $films,
        ]);
    }

    /**
     * Update the specified screening in storage.
     */
    public function update(Request $request, Screening $screening)
    {
        $validated = $request->validate([
            'film_id' => 'required|exists:films,id',
            'start_time' => 'required|date',
            'room' => 'required|string|max:50',
            'price' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $screening->update($validated);

        return redirect()->route('admin.screenings.index')
            ->with('success', 'Screening updated successfully.');
    }

    /**
     * Remove the specified screening from storage.
     */
    public function destroy(Screening $screening)
    {
        // Check if the screening has any reservations
        if ($screening->reservations()->exists()) {
            return redirect()->route('admin.screenings.index')
                ->with('error', 'Cannot delete screening with existing reservations.');
        }

        $screening->delete();

        return redirect()->route('admin.screenings.index')
            ->with('success', 'Screening deleted successfully.');
    }

    /**
     * Display screenings for a specific film.
     */
    public function filmScreenings(Film $film)
    {
        $screenings = $film->screenings()
            ->withCount(['seats as available_seats_count' => function ($query) {
                $query->where('status', 'available');
            }])
            ->orderBy('start_time')
            ->paginate(10);

        return Inertia::render('Admin/Films/Screenings', [
            'film' => $film,
            'screenings' => $screenings,
        ]);
    }

    /**
     * Repair seats for a screening.
     */
    public function repairSeats(Screening $screening)
    {
        // Delete existing seats if any
        $screening->seats()->delete();

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

        return redirect()->route('admin.screenings.show', $screening)
            ->with('success', "Created {$seatsCreated} seats for this screening.");
    }
}
