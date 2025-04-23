<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OmdbApiService
{
    protected $apiKey;
    protected $baseUrl = 'http://www.omdbapi.com/';

    public function __construct()
    {
        $this->apiKey = config('services.omdb.key');
    }

    /**
     * Search for films by title
     *
     * @param string $query
     * @param int $page
     * @return array
     */
    public function searchByTitle(string $query, int $page = 1): array
    {
        if (empty($this->apiKey)) {
            return [
                'success' => false,
                'message' => 'OMDB API key is not configured',
                'data' => []
            ];
        }

        try {
            $response = Http::get($this->baseUrl, [
                'apikey' => $this->apiKey,
                's' => $query,
                'page' => $page,
                'type' => 'movie'
            ]);

            if ($response->successful() && $response->json('Response') === 'True') {
                return [
                    'success' => true,
                    'data' => $response->json('Search'),
                    'total' => (int) $response->json('totalResults')
                ];
            }

            return [
                'success' => false,
                'message' => $response->json('Error') ?? 'Failed to retrieve data from OMDB API',
                'data' => []
            ];
        } catch (\Exception $e) {
            Log::error('OMDB API Error: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Error connecting to OMDB API',
                'data' => []
            ];
        }
    }

    /**
     * Get detailed information about a specific film by IMDb ID
     *
     * @param string $imdbId
     * @return array
     */
    public function getFilmDetails(string $imdbId): array
    {
        if (empty($this->apiKey)) {
            return [
                'success' => false,
                'message' => 'OMDB API key is not configured',
                'data' => null
            ];
        }

        try {
            $response = Http::get($this->baseUrl, [
                'apikey' => $this->apiKey,
                'i' => $imdbId,
                'plot' => 'full'
            ]);

            if ($response->successful() && $response->json('Response') === 'True') {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            return [
                'success' => false,
                'message' => $response->json('Error') ?? 'Failed to retrieve film details',
                'data' => null
            ];
        } catch (\Exception $e) {
            Log::error('OMDB API Error: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Error connecting to OMDB API',
                'data' => null
            ];
        }
    }
}
