import AdminLayout from '@/layouts/AdminLayout';
import { CalendarIcon, FilmIcon } from '@heroicons/react/24/outline';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

interface Film {
    id: number;
    title: string;
    description: string;
    duration: number;
    poster_image: string | null;
    genre: string;
    release_date: string;
    director: string;
    is_featured: boolean;
}

interface Props {
    film: Film;
}

export default function Edit({ film }: Props) {
    // Determine if the poster is a URL or a local file
    const isPosterUrl = film.poster_image && film.poster_image.startsWith('http');

    const { data, setData, post, processing, errors } = useForm<{
        title: string;
        description: string;
        director: string;
        duration: string;
        genre: string;
        release_date: string;
        poster_image: File | null;
        poster_url: string;
        poster_type: 'file' | 'url' | 'unchanged';
        is_featured: boolean;
        _method: string;
    }>({
        title: film.title || '',
        description: film.description || '',
        director: film.director || '',
        duration: film.duration?.toString() || '',
        genre: film.genre || '',
        release_date: film.release_date || '',
        poster_image: null as unknown as File | null,
        poster_url: isPosterUrl ? film.poster_image || '' : '',
        poster_type: isPosterUrl ? 'url' : 'unchanged',
        is_featured: film.is_featured || false,
        _method: 'PUT',
    });

    const [posterPreview, setPosterPreview] = useState<string | null>(
        film.poster_image ? (isPosterUrl ? film.poster_image : `/storage/${film.poster_image}`) : null,
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.films.update', { film: film.id }));
    };

    const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('poster_image', file);
            setData('poster_type', 'file');
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
        setData('poster_type', 'url');
        if (url) {
            setPosterPreview(url);
        } else {
            setPosterPreview(null);
        }
    };

    const handlePosterTypeChange = (type: 'file' | 'url' | 'unchanged') => {
        setData('poster_type', type);

        if (type === 'unchanged') {
            setPosterPreview(film.poster_image ? (isPosterUrl ? film.poster_image : `/storage/${film.poster_image}`) : null);
            setData('poster_url', '');
            setData('poster_image', null as unknown as File);
        } else if (type === 'file') {
            setPosterPreview(null);
            setData('poster_url', '');
        } else {
            setPosterPreview(data.poster_url || null);
            setData('poster_image', null as unknown as File);
        }
    };

    return (
        <AdminLayout title={`Edit Film: ${film.title}`} subtitle="Update film details">
            <Head title={`Edit Film: ${film.title}`} />

            {/* Header with back button */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                    <FilmIcon className="text-primary mr-2 h-6 w-6" />
                    <h2 className="text-foreground text-lg font-semibold">Edit Film</h2>
                </div>
                <div className="flex space-x-3">
                    <Link
                        href={route('admin.films.show', { film: film.id })}
                        className="border-border text-foreground hover:bg-muted flex items-center rounded-md border px-4 py-2 text-sm font-medium transition"
                    >
                        Cancel
                    </Link>
                    <Link
                        href={route('admin.films.index')}
                        className="border-border text-foreground hover:bg-muted flex items-center rounded-md border px-4 py-2 text-sm font-medium transition"
                    >
                        Back to Films
                    </Link>
                </div>
            </div>

            {/* Main form */}
            <div className="border-border bg-card rounded-lg border shadow-sm">
                <div className="border-border border-b p-4">
                    <h3 className="text-foreground font-medium">Film Information</h3>
                    <p className="text-muted-foreground text-sm">Update the details for {film.title}</p>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label htmlFor="title" className="text-foreground mb-1.5 block text-sm font-medium">
                                    Title <span className="text-destructive">*</span>
                                </label>
                                <input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className={`focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 ${
                                        errors.title ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
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
                                    className={`focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 ${
                                        errors.director ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
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
                                    className={`focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 ${
                                        errors.genre ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
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
                                    className={`focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 ${
                                        errors.duration ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
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
                                    className={`focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 ${
                                        errors.release_date ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                    }`}
                                />
                                {errors.release_date && <p className="text-destructive mt-1.5 text-sm">{errors.release_date}</p>}
                            </div>

                            <div className="flex h-full items-center">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_featured"
                                        checked={data.is_featured}
                                        onChange={(e) => setData('is_featured', e.target.checked)}
                                        className="text-primary focus:ring-primary/30 border-input h-5 w-5 rounded"
                                    />
                                    <label htmlFor="is_featured" className="text-foreground text-sm font-medium">
                                        Feature this film on homepage
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="text-foreground mb-1.5 block text-sm font-medium">
                                Description <span className="text-destructive">*</span>
                            </label>
                            <textarea
                                id="description"
                                rows={4}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className={`focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 ${
                                    errors.description ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                }`}
                                required
                            />
                            {errors.description && <p className="text-destructive mt-1.5 text-sm">{errors.description}</p>}
                        </div>

                        <div className="border-border rounded-lg border p-6">
                            <label className="text-foreground mb-3 block text-sm font-medium">Poster Image</label>

                            {/* Tabs for upload type */}
                            <div className="border-border mb-4 flex border-b">
                                <button
                                    type="button"
                                    className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                                        data.poster_type === 'unchanged'
                                            ? 'border-primary text-primary'
                                            : 'text-muted-foreground hover:text-foreground border-transparent'
                                    }`}
                                    onClick={() => handlePosterTypeChange('unchanged')}
                                >
                                    Keep Current
                                </button>
                                <button
                                    type="button"
                                    className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                                        data.poster_type === 'file'
                                            ? 'border-primary text-primary'
                                            : 'text-muted-foreground hover:text-foreground border-transparent'
                                    }`}
                                    onClick={() => handlePosterTypeChange('file')}
                                >
                                    <FilmIcon className="mr-1 inline-block h-4 w-4" />
                                    Upload New
                                </button>
                                <button
                                    type="button"
                                    className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                                        data.poster_type === 'url'
                                            ? 'border-primary text-primary'
                                            : 'text-muted-foreground hover:text-foreground border-transparent'
                                    }`}
                                    onClick={() => handlePosterTypeChange('url')}
                                >
                                    <CalendarIcon className="mr-1 inline-block h-4 w-4" />
                                    Use URL
                                </button>
                            </div>

                            <div className="flex flex-col items-start space-y-4 md:flex-row md:space-y-0 md:space-x-6">
                                <div className="w-full md:w-2/3">
                                    {data.poster_type === 'file' ? (
                                        <div className="border-border bg-muted/40 hover:bg-muted/70 relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors">
                                            <FilmIcon className="text-muted-foreground mb-2 h-10 w-10" />
                                            <div className="text-center">
                                                <p className="text-muted-foreground text-sm">Drop your image here, or</p>
                                                <label
                                                    htmlFor="poster_image"
                                                    className="text-primary hover:text-primary/90 mt-2 block cursor-pointer text-sm font-medium"
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
                                            <p className="text-muted-foreground mt-2 text-xs">PNG, JPG, GIF up to 10MB</p>
                                        </div>
                                    ) : data.poster_type === 'url' ? (
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
                                                className={`focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 ${
                                                    errors.poster_url ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                                }`}
                                            />
                                            <p className="text-muted-foreground mt-1 text-xs">Enter the direct URL to an image file</p>
                                        </div>
                                    ) : (
                                        <div className="bg-muted/20 rounded-lg p-6 text-center">
                                            <p className="text-muted-foreground">Using current poster image. Select another option to change.</p>
                                        </div>
                                    )}
                                    {errors.poster_image && <p className="text-destructive mt-1.5 text-sm">{errors.poster_image}</p>}
                                    {errors.poster_url && <p className="text-destructive mt-1.5 text-sm">{errors.poster_url}</p>}
                                    {errors.poster_type && <p className="text-destructive mt-1.5 text-sm">{errors.poster_type}</p>}
                                </div>

                                {posterPreview ? (
                                    <div className="border-border relative flex h-48 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border">
                                        <img src={posterPreview} alt="Poster preview" className="h-full w-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="border-border bg-muted/40 flex h-48 w-32 flex-shrink-0 items-center justify-center rounded-lg border">
                                        <p className="text-muted-foreground text-xs">No poster</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3">
                            <Link
                                href={route('admin.films.show', { film: film.id })}
                                className="border-border text-foreground hover:bg-muted inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium focus:ring-2 focus:outline-none disabled:opacity-70"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-primary/30 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition focus:ring-2 focus:outline-none disabled:opacity-70"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    'Update Film'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
