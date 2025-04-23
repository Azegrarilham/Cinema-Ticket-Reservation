<?php

namespace App\Http\Controllers;

use App\Models\Film;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;

class FilmController extends Controller
{
    /**
     * Display a listing of the films.
     */
    public function index(Request $request)
    {
        $cacheKey = 'films_page_' . $request->get('page', 1) . '_' .
                    $request->get('search', '') . '_' .
                    $request->get('genre', '');

        $films = Cache::remember($cacheKey, 60 * 5, function () use ($request) {
            return Film::query()
                ->when($request->search, function ($query, $search) {
                    $query->where('title', 'like', "%{$search}%");
                })
                ->when($request->genre, function ($query, $genre) {
                    $query->where('genre', $genre);
                })
                ->select('id', 'title', 'genre', 'duration', 'poster_image')
                ->orderBy('title')
                ->paginate(12)
                ->withQueryString();
        });

        $genres = Cache::remember('all_genres', 60 * 30, function () {
            return Film::distinct('genre')
                ->whereNotNull('genre')
                ->pluck('genre');
        });

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
        $cacheKey = 'film_' . $film->id;

        $filmData = Cache::remember($cacheKey, 60 * 15, function () use ($film) {
            $film->load(['futureScreenings' => function ($query) {
                $query->with('seats');
            }]);

            $screenings = $film->futureScreenings->groupBy(function ($screening) {
                return $screening->start_time->format('Y-m-d');
            });

            return [
                'film' => $film,
                'screenings' => $screenings
            ];
        });

        return Inertia::render('Client/Films/Show', $filmData);
    }

    /**
     * Display featured films on homepage.
     */
    public function home()
    {
        $latestFilms = Cache::remember('latest_films', 60 * 10, function () {
            return Film::select('id', 'title', 'poster_image', 'genre', 'duration')
                ->latest('created_at')
                ->take(6)
                ->get();
        });

        $featuredFilms = Cache::remember('featured_films', 60 * 10, function () {
            return Film::select('id', 'title', 'poster_image', 'genre', 'duration')
                ->where('is_featured', true)
                ->inRandomOrder()
                ->take(5)
                ->get();
        });

        return Inertia::render('Client/Welcome', [
            'featuredFilms' => $featuredFilms,
            'latestFilms' => $latestFilms,
        ]);
    }
}
