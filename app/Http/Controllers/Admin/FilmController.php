<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Film;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
            ->withCount('screenings')
            ->withCount('futureScreenings')
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
        $film->load(['screenings' => function ($query) {
            $query->orderBy('start_time');
        }]);

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
}
