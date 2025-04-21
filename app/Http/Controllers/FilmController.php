<?php

namespace App\Http\Controllers;

use App\Models\Film;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FilmController extends Controller
{
    /**
     * Display a listing of the films.
     */
    public function index(Request $request)
    {
        $films = Film::query()
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->when($request->genre, function ($query, $genre) {
                $query->where('genre', $genre);
            })
            ->orderBy('title')
            ->paginate(12)
            ->withQueryString();

        $genres = Film::distinct('genre')
            ->whereNotNull('genre')
            ->pluck('genre');

        return Inertia::render('Client/Films/Index', [
            'films' => $films,
            'genres' => $genres,
            'filters' => $request->only(['search', 'genre']),
        ]);
    }

    /**
     * Display the specified film.
     */
    public function show(Film $film)
    {
        $film->load(['futureScreenings' => function ($query) {
            $query->with('seats');
        }]);

        // Group screenings by date for better display
        $screenings = $film->futureScreenings->groupBy(function ($screening) {
            return $screening->start_time->format('Y-m-d');
        });

        return Inertia::render('Client/Films/Show', [
            'film' => $film,
            'screenings' => $screenings,
        ]);
    }

    /**
     * Display featured films on homepage.
     */
    public function home()
    {
        // Fetch latest films from our database
        $latestFilms = Film::latest('created_at')
            ->take(6)
            ->get();

        // Fetch random featured films (simulating an external API call)
        // In a real implementation, you would use an HTTP client to fetch data from an external API
        // This is a placeholder that fetches random films from our own database
        $featuredFilms = Film::inRandomOrder()
            ->limit(5)
            ->get();

        return Inertia::render('Client/Welcome', [
            'featuredFilms' => $featuredFilms,
            'latestFilms' => $latestFilms,
        ]);
    }
}
