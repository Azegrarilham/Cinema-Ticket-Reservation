<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Film;
use App\Services\OmdbApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class FilmController extends Controller
{
    protected $omdbApiService;

    public function __construct(OmdbApiService $omdbApiService)
    {
        $this->omdbApiService = $omdbApiService;
    }

    /**
     * Display a listing of the films.
     */
    public function index(Request $request)
    {
        $films = Film::query()
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->withCount('screenings')
            ->withCount(['futureScreenings as future_screenings_count'])
            ->orderBy('title')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Films/Index', [
            'films' => $films,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Show the form for creating a new film.
     */
    public function create()
    {
        return Inertia::render('Admin/Films/Create');
    }

    /**
     * Store a newly created film in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'duration' => 'required|integer|min:1',
            'poster_image' => 'nullable|image|max:2048',
            'poster_url' => 'nullable|url|max:2048',
            'poster_type' => 'required|in:file,url',
            'genre' => 'nullable|string|max:100',
            'release_date' => 'nullable|date',
            'director' => 'nullable|string|max:255',
            'is_featured' => 'boolean',
        ]);

        // Handle poster image based on chosen method
        if ($validated['poster_type'] === 'file' && $request->hasFile('poster_image')) {
            $path = $request->file('poster_image')->store('posters', 'public');
            $validated['poster_image'] = $path;
        } else if ($validated['poster_type'] === 'url' && !empty($validated['poster_url'])) {
            $validated['poster_image'] = $validated['poster_url'];
        }

        // Remove temporary fields
        unset($validated['poster_url']);
        unset($validated['poster_type']);

        Film::create($validated);

        return redirect()->route('admin.films.index')
            ->with('success', 'Film created successfully.');
    }

    /**
     * Display the specified film.
     */
    public function show(Film $film)
    {
        // Load film with screenings and add the counts
        $film->load(['screenings' => function ($query) {
            $query->orderBy('start_time');
        }]);

        // Add screenings count and future screenings count
        $film->screenings_count = $film->screenings->count();
        $film->future_screenings_count = $film->screenings->where('start_time', '>', now())->where('is_active', true)->count();

        return Inertia::render('Admin/Films/Show', [
            'film' => $film,
        ]);
    }

    /**
     * Show the form for editing the specified film.
     */
    public function edit(Film $film)
    {
        return Inertia::render('Admin/Films/Edit', [
            'film' => $film,
        ]);
    }

    /**
     * Update the specified film in storage.
     */
    public function update(Request $request, Film $film)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'duration' => 'required|integer|min:1',
            'poster_image' => 'nullable|image|max:2048',
            'poster_url' => 'nullable|url|max:2048',
            'poster_type' => 'required|in:file,url,unchanged',
            'genre' => 'nullable|string|max:100',
            'release_date' => 'nullable|date',
            'director' => 'nullable|string|max:255',
            'is_featured' => 'boolean',
        ]);

        // Handle poster image based on chosen method
        if ($validated['poster_type'] === 'file' && $request->hasFile('poster_image')) {
            // Delete old image if it's a local file (doesn't start with http)
            if ($film->poster_image && !str_starts_with($film->poster_image, 'http')) {
                Storage::disk('public')->delete($film->poster_image);
            }

            $path = $request->file('poster_image')->store('posters', 'public');
            $validated['poster_image'] = $path;
        } else if ($validated['poster_type'] === 'url' && !empty($validated['poster_url'])) {
            // If switching from file to URL, delete the old file
            if ($film->poster_image && !str_starts_with($film->poster_image, 'http')) {
                Storage::disk('public')->delete($film->poster_image);
            }

            $validated['poster_image'] = $validated['poster_url'];
        } else if ($validated['poster_type'] === 'unchanged') {
            // Keep the existing poster image
            unset($validated['poster_image']);
        }

        // Remove temporary fields
        unset($validated['poster_url']);
        unset($validated['poster_type']);

        $film->update($validated);

        return redirect()->route('admin.films.index')
            ->with('success', 'Film updated successfully.');
    }

    /**
     * Remove the specified film from storage.
     */
    public function destroy(Film $film)
    {
        // Delete poster image if exists
        if ($film->poster_image) {
            Storage::disk('public')->delete($film->poster_image);
        }

        $film->delete();

        return redirect()->route('admin.films.index')
            ->with('success', 'Film deleted successfully.');
    }

    /**
     * Search for films from OMDB API.
     */
    public function searchOmdb(Request $request)
    {
        $validated = $request->validate([
            'query' => 'required|string|min:2|max:100',
            'page' => 'nullable|integer|min:1',
        ]);

        $page = $validated['page'] ?? 1;
        $result = $this->omdbApiService->searchByTitle($validated['query'], $page);

        return response()->json($result);
    }

    /**
     * Get detailed information about a film from OMDB API.
     */
    public function getOmdbFilmDetails($imdb_id)
    {
        try {
            // Basic validation for IMDB ID format
            if (!str_starts_with($imdb_id, 'tt')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid IMDB ID format. Must start with "tt"',
                ], 422);
            }

            $result = $this->omdbApiService->getFilmDetails($imdb_id);
            return response()->json($result);
        } catch (\Exception $e) {
            \Log::error('OMDB API error', [
                'error' => $e->getMessage(),
                'imdb_id' => $imdb_id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error processing request: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Import a film from OMDB API.
     */
    public function importFromOmdb(Request $request)
    {
        $validated = $request->validate([
            'imdb_id' => 'required|string|starts_with:tt',
            'is_featured' => 'boolean',
        ]);

        $result = $this->omdbApiService->getFilmDetails($validated['imdb_id']);

        if (!$result['success']) {
            return response()->json($result, 422);
        }

        $filmData = $result['data'];

        // Check if the film already exists in the database
        $existingFilm = Film::where('title', $filmData['Title'])->first();
        if ($existingFilm) {
            return response()->json([
                'success' => false,
                'message' => 'Film with this title already exists in the database',
                'data' => $existingFilm
            ], 422);
        }

        // Convert runtime from "123 min" to integer
        $durationString = $filmData['Runtime'] ?? '0 min';
        $duration = (int) filter_var($durationString, FILTER_SANITIZE_NUMBER_INT);

        // Create the film
        $film = Film::create([
            'title' => $filmData['Title'],
            'description' => $filmData['Plot'] ?? '',
            'director' => $filmData['Director'] ?? '',
            'duration' => $duration > 0 ? $duration : 120, // Default to 120 minutes if parsing fails
            'genre' => $filmData['Genre'] ?? '',
            'release_date' => $filmData['Released'] !== 'N/A' ? date('Y-m-d', strtotime($filmData['Released'])) : null,
            'poster_image' => $filmData['Poster'] !== 'N/A' ? $filmData['Poster'] : null,
            'is_featured' => $validated['is_featured'] ?? false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Film imported successfully',
            'data' => $film
        ]);
    }
}
