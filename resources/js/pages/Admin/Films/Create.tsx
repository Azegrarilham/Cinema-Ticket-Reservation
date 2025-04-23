import AdminLayout from '@/layouts/AdminLayout';
import { CalendarIcon, FilmIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface OmdbSearchResult {
    Title: string;
    Year: string;
    imdbID: string;
    Type: string;
    Poster: string;
}

interface OmdbDetailResult {
    Title: string;
    Year: string;
    Rated: string;
    Released: string;
    Runtime: string;
    Genre: string;
    Director: string;
    Writer: string;
    Actors: string;
    Plot: string;
    Poster: string;
    imdbID: string;
    imdbRating: string;
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            when: 'beforeChildren',
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 100 }
    },
};

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm<{
        title: string;
        description: string;
        director: string;
        duration: string;
        genre: string;
        release_date: string;
        poster_image: File | null;
        poster_url: string;
        poster_type: 'file' | 'url';
        is_featured: boolean;
    }>({
        title: '',
        description: '',
        director: '',
        duration: '',
        genre: '',
        release_date: '',
        poster_image: null as unknown as File | null,
        poster_url: '',
        poster_type: 'file', // Default to file upload
        is_featured: false,
    });

    const [posterPreview, setPosterPreview] = useState<string | null>(null);

    // OMDB API related states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<OmdbSearchResult[]>([]);
    const [selectedFilm, setSelectedFilm] = useState<OmdbDetailResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState('');
    const [activeTab, setActiveTab] = useState<'manual' | 'omdb'>('manual');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.films.store'), {
            onSuccess: () => reset(),
        });
    };

    const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('poster_image', file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPosterPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePosterUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setData('poster_url', url);
        if (url) {
            setPosterPreview(url);
        } else {
            setPosterPreview(null);
        }
    };

    const handlePosterTypeChange = (type: 'file' | 'url') => {
        setData('poster_type', type);
        setPosterPreview(null);
        if (type === 'file') {
            setData('poster_url', '');
        } else {
            setData('poster_image', null as unknown as File);
        }
    };

    // OMDB API related functions
    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!searchQuery.trim()) {
            setSearchError('Please enter a search term');
            return;
        }

        setIsSearching(true);
        setSearchResults([]);
        setSearchError('');

        try {
            const response = await axios.post(route('admin.films.omdb.search'), {
                query: searchQuery
            });

            if (response.data.success) {
                setSearchResults(response.data.data || []);
                if (response.data.data.length === 0) {
                    setSearchError('No results found for your query');
                }
            } else {
                setSearchError(response.data.message || 'Error searching for films');
            }
        } catch (error) {
            setSearchError('Error connecting to the OMDB API');
            console.error('OMDB search error', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectFilm = async (imdbId: string) => {
        try {
            setIsSearching(true);
            setImportError('');

            // Make a direct HTTP request to the correct endpoint
            const response = await axios.get(`/admin/films/omdb/${imdbId}/details`);

            if (response.data.success) {
                const filmData = response.data.data;
                setSelectedFilm(filmData);

                // Prefill the form with the film data, ensuring all values are defined
                setData({
                    title: filmData.Title || '',
                    description: filmData.Plot || '',
                    director: filmData.Director || '',
                    duration: filmData.Runtime ? filmData.Runtime.replace(/\D/g, '') : '',
                    genre: filmData.Genre || '',
                    release_date: filmData.Released !== 'N/A' ? new Date(filmData.Released).toISOString().split('T')[0] : '',
                    poster_image: null,
                    poster_url: filmData.Poster !== 'N/A' ? filmData.Poster : '',
                    poster_type: 'url',
                    is_featured: false
                });

                // Set the poster preview
                if (filmData.Poster !== 'N/A') {
                    setPosterPreview(filmData.Poster);
                }
            } else {
                setImportError(response.data.message || 'Error fetching film details');
            }
        } catch (error) {
            console.error('OMDB details error', error);
            setImportError('Error connecting to the OMDB API');
        } finally {
            setIsSearching(false);
        }
    };

    const handleImportFilm = async (imdbId: string) => {
        try {
            setIsImporting(true);
            const response = await axios.post(route('admin.films.omdb.import'), {
                imdb_id: imdbId,
                is_featured: data.is_featured
            });

            if (response.data.success) {
                window.location.href = route('admin.films.index');
            } else {
                setImportError(response.data.message || 'Error importing film');
            }
        } catch (error) {
            setImportError('Error importing film');
            console.error('OMDB import error', error);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <AdminLayout title="Add New Film" subtitle="Create a new film in your catalog">
            <Head title="Add New Film" />

            <motion.div
                className="container px-4 py-6 mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header with back button */}
                <motion.div
                    className="flex items-center justify-between mb-6"
                    variants={itemVariants}
                >
                    <div className="flex items-center">
                        <motion.div
                            className="flex items-center justify-center w-10 h-10 mr-3 rounded-lg bg-primary/10"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            <FilmIcon className="w-6 h-6 text-primary" />
                        </motion.div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Create Film</h1>
                            <p className="text-sm text-muted-foreground">Add a new film to the catalog</p>
                        </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                            href={route('admin.films.index')}
                            className="flex items-center px-4 py-2 text-sm font-medium transition border rounded-md border-border text-foreground hover:bg-muted"
                        >
                            Back to Films
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Main form */}
                <motion.div
                    className="overflow-hidden border rounded-lg shadow-sm border-border bg-card"
                    variants={itemVariants}
                    whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="p-4 border-b border-border">
                        <h3 className="font-medium text-foreground">Film Information</h3>
                        <p className="text-sm text-muted-foreground">Fill in the details for the new film</p>
                    </div>

                    <div className="p-6">
                        {/* Tabs for creation method */}
                        <motion.div
                            className="flex mb-6 border-b border-border"
                            variants={itemVariants}
                        >
                            <motion.button
                                type="button"
                                className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'manual'
                                    ? 'border-primary text-primary'
                                    : 'text-muted-foreground hover:text-foreground border-transparent'
                                    }`}
                                onClick={() => setActiveTab('manual')}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FilmIcon className="inline-block w-4 h-4 mr-1" />
                                Manual Entry
                            </motion.button>
                            <motion.button
                                type="button"
                                className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'omdb'
                                    ? 'border-primary text-primary'
                                    : 'text-muted-foreground hover:text-foreground border-transparent'
                                    }`}
                                onClick={() => setActiveTab('omdb')}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <MagnifyingGlassIcon className="inline-block w-4 h-4 mr-1" />
                                Import from OMDB
                            </motion.button>
                        </motion.div>

                        {activeTab === 'omdb' ? (
                            <motion.div className="space-y-6" variants={itemVariants}>
                                <div className="flex items-center mb-4">
                                    <motion.div
                                        className="relative flex-1 mr-4"
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <MagnifyingGlassIcon className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search for a film title..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full py-2 pl-10 pr-4 border rounded-md bg-background border-input focus:border-primary focus:ring-primary/30"
                                        />
                                    </motion.div>
                                    <motion.button
                                        type="button"
                                        onClick={() => handleSearch()}
                                        disabled={isSearching || !searchQuery.trim()}
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium transition rounded-md bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {isSearching ? 'Searching...' : 'Search OMDB'}
                                    </motion.button>
                                </div>

                                {searchError && (
                                    <div className="p-4 mb-4 text-sm border rounded-md text-destructive border-destructive/20 bg-destructive/10">
                                        {searchError}
                                    </div>
                                )}

                                {searchResults.length > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-medium text-foreground">Search Results</h4>
                                        <div className="overflow-hidden border rounded-md border-border">
                                            <table className="min-w-full divide-y divide-border">
                                                <thead className="bg-muted/50">
                                                    <tr>
                                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-medium text-muted-foreground sm:pl-6">Poster</th>
                                                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-muted-foreground">Title</th>
                                                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-muted-foreground">Year</th>
                                                        <th scope="col" className="px-3 py-3.5 text-right text-xs font-medium text-muted-foreground">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border bg-background">
                                                    {searchResults.map((result) => (
                                                        <tr key={result.imdbID}>
                                                            <td className="py-4 pl-4 pr-3 text-sm whitespace-nowrap sm:pl-6">
                                                                <div className="flex items-center">
                                                                    <div className="flex-shrink-0 w-12 h-16 overflow-hidden rounded">
                                                                        {result.Poster && result.Poster !== 'N/A' ? (
                                                                            <img src={result.Poster} alt={result.Title} className="object-cover w-full h-full" />
                                                                        ) : (
                                                                            <div className="flex items-center justify-center w-full h-full bg-muted">
                                                                                <FilmIcon className="w-6 h-6 text-muted-foreground" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-4 text-sm whitespace-nowrap text-foreground">{result.Title}</td>
                                                            <td className="px-3 py-4 text-sm whitespace-nowrap text-foreground">{result.Year}</td>
                                                            <td className="px-3 py-4 text-sm text-right whitespace-nowrap">
                                                                <div className="flex justify-end space-x-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleSelectFilm(result.imdbID)}
                                                                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-primary hover:text-primary/90 border border-primary hover:bg-primary/10 focus:outline-none"
                                                                    >
                                                                        Fill Form
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleImportFilm(result.imdbID)}
                                                                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none"
                                                                    >
                                                                        Import
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {selectedFilm && (
                                    <div className="p-4 mt-6 border rounded-md border-border bg-muted/20">
                                        <div className="flex space-x-4">
                                            {selectedFilm.Poster && selectedFilm.Poster !== 'N/A' ? (
                                                <img
                                                    src={selectedFilm.Poster}
                                                    alt={selectedFilm.Title}
                                                    className="object-cover h-40 rounded w-28"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-40 rounded w-28 bg-muted">
                                                    <FilmIcon className="w-10 h-10 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h3 className="text-lg font-medium text-foreground">{selectedFilm.Title} ({selectedFilm.Year})</h3>
                                                <div className="mt-1 text-sm text-muted-foreground">
                                                    <p><span className="font-medium">Director:</span> {selectedFilm.Director}</p>
                                                    <p><span className="font-medium">Genre:</span> {selectedFilm.Genre}</p>
                                                    <p><span className="font-medium">Runtime:</span> {selectedFilm.Runtime}</p>
                                                    <p><span className="font-medium">Rating:</span> {selectedFilm.imdbRating}/10</p>
                                                </div>
                                                <div className="mt-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleImportFilm(selectedFilm.imdbID)}
                                                        className="inline-flex items-center px-3 py-2 text-sm font-medium transition rounded-md bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-primary/30 focus:ring-2 focus:outline-none disabled:opacity-70"
                                                        disabled={isImporting}
                                                    >
                                                        {isImporting ? 'Importing...' : 'Import Film'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {importError && (
                                    <div className="p-4 mt-4 text-sm border rounded-md text-destructive border-destructive/20 bg-destructive/10">
                                        {importError}
                                    </div>
                                )}

                                <div className="flex items-center pt-4 mt-6 border-t border-border">
                                    <input
                                        type="checkbox"
                                        id="omdb_is_featured"
                                        checked={data.is_featured}
                                        onChange={(e) => setData('is_featured', e.target.checked)}
                                        className="w-5 h-5 rounded text-primary focus:ring-primary/30 border-input"
                                    />
                                    <label htmlFor="omdb_is_featured" className="ml-2 text-sm font-medium text-foreground">
                                        Feature imported film on homepage
                                    </label>
                                </div>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <motion.div className="grid grid-cols-1 gap-6 md:grid-cols-2" variants={itemVariants}>
                                    <div>
                                        <label htmlFor="title" className="text-foreground mb-1.5 block text-sm font-medium">
                                            Title <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className={`focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 ${errors.title ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                                }`}
                                            required
                                        />
                                        {errors.title && <p className="text-destructive mt-1.5 text-sm">{errors.title}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="director" className="text-foreground mb-1.5 block text-sm font-medium">
                                            Director
                                        </label>
                                        <input
                                            id="director"
                                            value={data.director}
                                            onChange={(e) => setData('director', e.target.value)}
                                            className={`focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 ${errors.director ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                                }`}
                                        />
                                        {errors.director && <p className="text-destructive mt-1.5 text-sm">{errors.director}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="genre" className="text-foreground mb-1.5 block text-sm font-medium">
                                            Genre
                                        </label>
                                        <input
                                            id="genre"
                                            value={data.genre}
                                            onChange={(e) => setData('genre', e.target.value)}
                                            className={`focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 ${errors.genre ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                                }`}
                                        />
                                        {errors.genre && <p className="text-destructive mt-1.5 text-sm">{errors.genre}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="duration" className="text-foreground mb-1.5 block text-sm font-medium">
                                            Duration (minutes) <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            id="duration"
                                            type="number"
                                            value={data.duration}
                                            onChange={(e) => setData('duration', e.target.value)}
                                            className={`focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 ${errors.duration ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                                }`}
                                            required
                                        />
                                        {errors.duration && <p className="text-destructive mt-1.5 text-sm">{errors.duration}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="release_date" className="text-foreground mb-1.5 block text-sm font-medium">
                                            Release Date
                                        </label>
                                        <input
                                            id="release_date"
                                            type="date"
                                            value={data.release_date}
                                            onChange={(e) => setData('release_date', e.target.value)}
                                            className={`focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 ${errors.release_date ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                                }`}
                                        />
                                        {errors.release_date && <p className="text-destructive mt-1.5 text-sm">{errors.release_date}</p>}
                                    </div>

                                    <div className="flex items-center h-full">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="is_featured"
                                                checked={data.is_featured}
                                                onChange={(e) => setData('is_featured', e.target.checked)}
                                                className="w-5 h-5 rounded text-primary focus:ring-primary/30 border-input"
                                            />
                                            <label htmlFor="is_featured" className="text-sm font-medium text-foreground">
                                                Feature this film on homepage
                                            </label>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <label htmlFor="description" className="text-foreground mb-1.5 block text-sm font-medium">
                                        Description <span className="text-destructive">*</span>
                                    </label>
                                    <textarea
                                        id="description"
                                        rows={4}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className={`focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 ${errors.description ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                            }`}
                                        required
                                    />
                                    {errors.description && <p className="text-destructive mt-1.5 text-sm">{errors.description}</p>}
                                </motion.div>

                                <motion.div
                                    className="p-6 border rounded-lg border-border"
                                    variants={itemVariants}
                                    whileHover={{ y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <label className="block mb-3 text-sm font-medium text-foreground">Poster Image</label>

                                    {/* Tabs for upload type */}
                                    <div className="flex mb-4 border-b border-border">
                                        <button
                                            type="button"
                                            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${data.poster_type === 'file'
                                                ? 'border-primary text-primary'
                                                : 'text-muted-foreground hover:text-foreground border-transparent'
                                                }`}
                                            onClick={() => handlePosterTypeChange('file')}
                                        >
                                            <FilmIcon className="inline-block w-4 h-4 mr-1" />
                                            Upload Image
                                        </button>
                                        <button
                                            type="button"
                                            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${data.poster_type === 'url'
                                                ? 'border-primary text-primary'
                                                : 'text-muted-foreground hover:text-foreground border-transparent'
                                                }`}
                                            onClick={() => handlePosterTypeChange('url')}
                                        >
                                            <CalendarIcon className="inline-block w-4 h-4 mr-1" />
                                            Use URL
                                        </button>
                                    </div>

                                    <div className="flex flex-col items-start space-y-4 md:flex-row md:space-y-0 md:space-x-6">
                                        <div className="w-full md:w-2/3">
                                            {data.poster_type === 'file' ? (
                                                <div className="relative flex flex-col items-center justify-center p-6 transition-colors border-2 border-dashed rounded-lg cursor-pointer border-border bg-muted/40 hover:bg-muted/70">
                                                    <FilmIcon className="w-10 h-10 mb-2 text-muted-foreground" />
                                                    <div className="text-center">
                                                        <p className="text-sm text-muted-foreground">Drop your image here, or</p>
                                                        <label
                                                            htmlFor="poster_image"
                                                            className="block mt-2 text-sm font-medium cursor-pointer text-primary hover:text-primary/90"
                                                        >
                                                            Browse files
                                                            <input
                                                                id="poster_image"
                                                                name="poster_image"
                                                                type="file"
                                                                className="sr-only"
                                                                onChange={handlePosterChange}
                                                                accept="image/*"
                                                            />
                                                        </label>
                                                    </div>
                                                    <p className="mt-2 text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <label htmlFor="poster_url" className="text-foreground mb-1.5 block text-sm font-medium">
                                                        Poster Image URL
                                                    </label>
                                                    <input
                                                        id="poster_url"
                                                        type="url"
                                                        value={data.poster_url}
                                                        onChange={handlePosterUrlChange}
                                                        placeholder="https://example.com/poster.jpg"
                                                        className={`focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 ${errors.poster_url ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                                            }`}
                                                    />
                                                    <p className="mt-1 text-xs text-muted-foreground">Enter the direct URL to an image file</p>
                                                </div>
                                            )}
                                            {errors.poster_image && <p className="text-destructive mt-1.5 text-sm">{errors.poster_image}</p>}
                                            {errors.poster_url && <p className="text-destructive mt-1.5 text-sm">{errors.poster_url}</p>}
                                            {errors.poster_type && <p className="text-destructive mt-1.5 text-sm">{errors.poster_type}</p>}
                                        </div>

                                        {posterPreview ? (
                                            <div className="relative flex items-center justify-center flex-shrink-0 w-32 h-48 overflow-hidden border rounded-lg border-border">
                                                <img src={posterPreview} alt="Poster preview" className="object-cover w-full h-full" />
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center flex-shrink-0 w-32 h-48 border rounded-lg border-border bg-muted/40">
                                                <p className="text-xs text-muted-foreground">Preview</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="flex justify-end space-x-3 pt-6"
                                    variants={itemVariants}
                                >
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Link
                                            href={route('admin.films.index')}
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium transition border rounded-md border-border text-foreground hover:bg-muted"
                                        >
                                            Cancel
                                        </Link>
                                    </motion.div>
                                    <motion.button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium transition shadow-sm rounded-md bg-primary text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {processing ? 'Creating...' : 'Create Film'}
                                    </motion.button>
                                </motion.div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AdminLayout>
    );
}
