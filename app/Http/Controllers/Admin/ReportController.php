<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Film;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Screening;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Display film popularity report.
     */
    public function films(Request $request)
    {
        $period = $request->period ?? 'month';
        $startDate = $this->getStartDate($period);

        $films = Film::withCount(['reservations' => function ($query) use ($startDate) {
                $query->where('reservations.created_at', '>=', $startDate);
            }])
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->orderByDesc('reservations_count')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Reports/Films', [
            'films' => $films,
            'period' => $period,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Display revenue report.
     */
    public function revenue(Request $request)
    {
        $period = $request->period ?? 'month';
        $startDate = $this->getStartDate($period);

        // Get daily revenue for chart
        $dailyRevenue = Payment::select(
                DB::raw('DATE(payments.created_at) as date'),
                DB::raw('SUM(payments.amount) as revenue')
            )
            ->where('payments.status', 'completed')
            ->where('payments.created_at', '>=', $startDate)
            ->when($request->film_id, function ($query, $filmId) {
                $query->join('reservations', 'payments.reservation_id', '=', 'reservations.id')
                      ->join('screenings', 'reservations.screening_id', '=', 'screenings.id')
                      ->where('screenings.film_id', $filmId);
            })
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Get revenue by film
        $filmRevenue = Payment::select(
                'films.id',
                'films.title',
                DB::raw('SUM(payments.amount) as revenue'),
                DB::raw('COUNT(payments.id) as count')
            )
            ->join('reservations', 'payments.reservation_id', '=', 'reservations.id')
            ->join('screenings', 'reservations.screening_id', '=', 'screenings.id')
            ->join('films', 'screenings.film_id', '=', 'films.id')
            ->where('payments.status', 'completed')
            ->where('payments.created_at', '>=', $startDate)
            ->when($request->film_id, function ($query, $filmId) {
                $query->where('films.id', $filmId);
            })
            ->groupBy('films.id', 'films.title')
            ->orderByDesc('revenue')
            ->get();

        // Get total revenue with the same film filter if specified
        $totalRevenueQuery = Payment::where('payments.status', 'completed')
            ->where('payments.created_at', '>=', $startDate);

        if ($request->film_id) {
            $totalRevenueQuery->join('reservations', 'payments.reservation_id', '=', 'reservations.id')
                              ->join('screenings', 'reservations.screening_id', '=', 'screenings.id')
                              ->join('films', 'screenings.film_id', '=', 'films.id')
                              ->where('films.id', $request->film_id);
        }

        $totalRevenue = $totalRevenueQuery->sum('payments.amount');

        $films = Film::orderBy('title')->get(['id', 'title']);

        return Inertia::render('Admin/Reports/Revenue', [
            'dailyRevenue' => $dailyRevenue,
            'filmRevenue' => $filmRevenue,
            'totalRevenue' => $totalRevenue,
            'films' => $films,
            'period' => $period,
            'filters' => $request->only('film_id'),
        ]);
    }

    /**
     * Display screening occupancy report.
     */
    public function screenings(Request $request)
    {
        $screenings = Screening::with('film')
            ->withCount(['reservationSeats as occupied_seats' => function ($query) {
                $query->whereHas('reservation', function ($q) {
                    $q->whereIn('reservations.status', ['pending', 'confirmed']);
                });
            }])
            ->when($request->film_id, function ($query, $filmId) {
                $query->where('screenings.film_id', $filmId);
            })
            ->when($request->date, function ($query, $date) {
                $query->whereDate('screenings.start_time', $date);
            })
            ->when($request->is_full === 'true', function ($query) {
                $query->whereRaw('(SELECT COUNT(*) FROM seats WHERE seats.screening_id = screenings.id AND seats.status != "available") = screenings.total_seats');
            })
            ->when($request->is_future === 'true', function ($query) {
                $query->where('screenings.start_time', '>', now());
            })
            ->withCount('seats')
            ->orderBy('screenings.start_time')
            ->paginate(10)
            ->withQueryString();

        $films = Film::orderBy('title')->get(['id', 'title']);

        return Inertia::render('Admin/Reports/Screenings', [
            'screenings' => $screenings,
            'films' => $films,
            'filters' => $request->only(['film_id', 'date', 'is_full', 'is_future']),
        ]);
    }

    /**
     * Get start date based on period.
     */
    private function getStartDate($period): \DateTime
    {
        $now = now();

        return match($period) {
            'week' => $now->copy()->subWeek(),
            'month' => $now->copy()->subMonth(),
            'quarter' => $now->copy()->subQuarter(),
            'year' => $now->copy()->subYear(),
            'all' => $now->copy()->subYears(10),
            default => $now->copy()->subMonth(),
        };
    }
}
