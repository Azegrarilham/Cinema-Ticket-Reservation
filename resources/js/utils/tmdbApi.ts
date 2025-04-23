/**
 * Utility functions for fetching movie data from OMDb API
 */

// Free public API key for OMDb API - limited to 1000 requests per day
const API_KEY = 'c786c39d';
const BASE_URL = 'https://www.omdbapi.com';

// Track whether we're using the API or fallback data
let isUsingFallbackData = false;

// Hard-coded list of upcoming movie titles to search for
const UPCOMING_MOVIES = [
    'Deadpool & Wolverine',
    'Alien: Romulus',
    'Borderlands',
    'Kraven the Hunter',
    'Beetlejuice Beetlejuice',
    'Joker: Folie à Deux',
];

// Fallback data in case the API fails or rate limits are exceeded
const FALLBACK_DATA = [
    {
        id: 'tt6263850',
        title: 'Deadpool & Wolverine',
        poster_path:
            'https://m.media-amazon.com/images/M/MV5BODE3M2M2ZjUtOTRjNi00YjQxLWJlZTUtY2FkMzY0YmRhOGU1XkEyXkFqcGdeQXVyMTM0ODM4NzM5._V1_SX300.jpg',
        release_date: '2024-07-26',
        overview: 'Deadpool and Wolverine team up on a mission that will change the Marvel Cinematic Universe forever.',
        director: 'Shawn Levy',
        genre: 'Action, Adventure, Comedy',
        runtime: '127 min',
    },
    {
        id: 'tt5362988',
        title: 'Alien: Romulus',
        poster_path:
            'https://m.media-amazon.com/images/M/MV5BOWQ3MDg1MTgtMmI4ZC00YjU3LWI4OTEtMTI4MGJmODhiZjU2XkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg',
        release_date: '2024-08-16',
        overview:
            'The ninth film in the Alien franchise. Young people on a distant colony find themselves in a confrontation with the most terrifying life form in the universe.',
        director: 'Fede Alvarez',
        genre: 'Horror, Sci-Fi, Thriller',
        runtime: '119 min',
    },
    {
        id: 'tt0822854',
        title: 'Borderlands',
        poster_path:
            'https://m.media-amazon.com/images/M/MV5BMTRjYjBkM2ItOGQzNi00Njg1LTk0ZWMtMTY0M2Y0NGJjZTVlXkEyXkFqcGdeQXVyMTAxNzQ1NzI@._V1_SX300.jpg',
        release_date: '2024-08-09',
        overview:
            "Lilith, an infamous outlaw with a mysterious past, reluctantly returns to her home planet of Pandora to find the missing daughter of the universe's most powerful man, Atlas.",
        director: 'Eli Roth',
        genre: 'Action, Adventure, Sci-Fi',
        runtime: '105 min',
    },
    {
        id: 'tt13968674',
        title: 'Kraven the Hunter',
        poster_path:
            'https://m.media-amazon.com/images/M/MV5BMWM1YjhjNGYtNTZmYS00ZTMzLTk1OGYtOWUyODQ3Y2ZkMjQ4XkEyXkFqcGdeQXVyMzMwNDQ1MzY@._V1_SX300.jpg',
        release_date: '2024-12-13',
        overview: 'Russian immigrant Sergei Kravinoff is on a mission to prove that he is the greatest hunter in the world.',
        director: 'J.C. Chandor',
        genre: 'Action, Adventure, Sci-Fi',
        runtime: 'N/A',
    },
    {
        id: 'tt2049403',
        title: 'Beetlejuice Beetlejuice',
        poster_path:
            'https://m.media-amazon.com/images/M/MV5BNzJhODM1ODktMDQyOS00ZWI1LTgxN2QtMGI5MzNjMWM2YTkwXkEyXkFqcGdeQXVyMTAxNzQ1NzI@._V1_SX300.jpg',
        release_date: '2024-09-06',
        overview:
            "The Deetz family returns to Winter River after an unexpected family tragedy. Still haunted by Beetlejuice, Lydia's life is turned upside down when her rebellious teenage daughter discovers the mysterious model of the town in the attic and the portal to the Afterlife is accidentally opened.",
        director: 'Tim Burton',
        genre: 'Comedy, Fantasy, Horror',
        runtime: 'N/A',
    },
    {
        id: 'tt11315808',
        title: 'Joker: Folie à Deux',
        poster_path:
            'https://m.media-amazon.com/images/M/MV5BNzA1MTM1OGQtYzc4Zi00ZDlkLWJmM2QtYWU2MjNiZWYyZjBhXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg',
        release_date: '2024-10-04',
        overview:
            "Arthur Fleck is institutionalized at Arkham awaiting trial for his crimes as Joker. While struggling with his dual identity, Arthur not only stumbles upon true love but also finds the music that's always been inside him.",
        director: 'Todd Phillips',
        genre: 'Crime, Drama, Music',
        runtime: '138 min',
    },
];

/**
 * Checks if we're using fallback data or actual API data
 */
export const getDataSource = () => {
    return {
        isUsingFallbackData,
        apiKey: API_KEY,
    };
};

/**
 * Fetches upcoming movies from OMDb API
 */
export const fetchUpcomingMovies = async () => {
    try {
        // Reset the flag at the start of each fetch
        isUsingFallbackData = false;

        // Fetch multiple movies in parallel
        const moviePromises = UPCOMING_MOVIES.map(async (title) => {
            const response = await fetch(`${BASE_URL}/?apikey=${API_KEY}&t=${encodeURIComponent(title)}&plot=short`);

            if (!response.ok) {
                throw new Error(`Failed to fetch movie: ${title}`);
            }

            const movie = await response.json();

            if (movie.Response === 'False') {
                console.error(`Movie not found: ${title}`);
                return null;
            }

            // Transform the data to match our interface
            return {
                id: movie.imdbID,
                title: movie.Title,
                poster_path: movie.Poster,
                release_date: movie.Year + '-01-01', // OMDb only gives year for most movies
                overview: movie.Plot,
                director: movie.Director,
                genre: movie.Genre,
                runtime: movie.Runtime,
            };
        });

        const results = await Promise.all(moviePromises);
        const validResults = results.filter((movie) => movie !== null);

        // If we have results from the API, return them
        if (validResults.length > 0) {
            console.log('Successfully fetched movie data from OMDb API');
            return validResults;
        }

        // Otherwise fall back to our static data
        console.log('No results from API, using fallback data for upcoming movies');
        isUsingFallbackData = true;
        return FALLBACK_DATA;
    } catch (error) {
        console.error('Error fetching upcoming movies:', error);
        console.log('Using fallback data for upcoming movies due to error');
        isUsingFallbackData = true;
        return FALLBACK_DATA;
    }
};

/**
 * Fetches movie details from OMDb API
 */
export const fetchMovieDetails = async (imdbID: string) => {
    try {
        const response = await fetch(`${BASE_URL}/?apikey=${API_KEY}&i=${imdbID}&plot=full`);

        if (!response.ok) {
            throw new Error('Failed to fetch movie details');
        }

        const movie = await response.json();

        if (movie.Response === 'False') {
            throw new Error(`Movie not found: ${imdbID}`);
        }

        return movie;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        throw error;
    }
};

/**
 * Gets full image path for movie posters
 */
export const getImageUrl = (path: string | null) => {
    if (!path || path === 'N/A') return '/storage/images/poster-placeholder.jpg';
    return path;
};

/**
 * Tests the connection to the OMDb API
 */
export const testApiConnection = async () => {
    try {
        const testMovie = 'Inception';
        const response = await fetch(`${BASE_URL}/?apikey=${API_KEY}&t=${encodeURIComponent(testMovie)}`);

        if (!response.ok) {
            return {
                success: false,
                message: `HTTP error: ${response.status}`,
                apiKey: API_KEY,
            };
        }

        const data = await response.json();

        if (data.Response === 'False') {
            return {
                success: false,
                message: data.Error || 'Movie not found',
                apiKey: API_KEY,
            };
        }

        return {
            success: true,
            message: 'API connection successful',
            title: data.Title,
            apiKey: API_KEY,
        };
    } catch (error) {
        return {
            success: false,
            message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            apiKey: API_KEY,
        };
    }
};
