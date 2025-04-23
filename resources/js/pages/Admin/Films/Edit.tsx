import AdminLayout from '@/layouts/AdminLayout';
import { CalendarIcon, FilmIcon } from '@heroicons/react/24/outline';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import React, { useState } from 'react';

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
                            <h1 className="text-2xl font-bold text-foreground">Edit Film</h1>
                            <p className="text-sm text-muted-foreground">{film.title}</p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link
                                href={route('admin.films.show', { film: film.id })}
                                className="flex items-center px-4 py-2 text-sm font-medium transition border rounded-md border-border text-foreground hover:bg-muted"
                            >
                                Cancel
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link
                                href={route('admin.films.index')}
                                className="flex items-center px-4 py-2 text-sm font-medium transition border rounded-md border-border text-foreground hover:bg-muted"
                            >
                                Back to Films
                            </Link>
                        </motion.div>
                    </div>
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
                        <p className="text-sm text-muted-foreground">Update the details for {film.title}</p>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <motion.div
                                className="grid grid-cols-1 gap-6 md:grid-cols-2"
                                variants={itemVariants}
                            >
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <label htmlFor="title" className="block mb-1.5 text-sm font-medium text-foreground">
                                        Title <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md bg-background text-foreground border-input focus:border-primary focus:ring-primary/30 placeholder:text-muted-foreground ${errors.title ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                            }`}
                                        required
                                    />
                                    {errors.title && <p className="mt-1.5 text-sm text-destructive">{errors.title}</p>}
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <label htmlFor="director" className="block mb-1.5 text-sm font-medium text-foreground">
                                        Director
                                    </label>
                                    <input
                                        id="director"
                                        value={data.director}
                                        onChange={(e) => setData('director', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md bg-background text-foreground border-input focus:border-primary focus:ring-primary/30 placeholder:text-muted-foreground ${errors.director ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                            }`}
                                    />
                                    {errors.director && <p className="mt-1.5 text-sm text-destructive">{errors.director}</p>}
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <label htmlFor="genre" className="block mb-1.5 text-sm font-medium text-foreground">
                                        Genre
                                    </label>
                                    <input
                                        id="genre"
                                        value={data.genre}
                                        onChange={(e) => setData('genre', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md bg-background text-foreground border-input focus:border-primary focus:ring-primary/30 placeholder:text-muted-foreground ${errors.genre ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                            }`}
                                    />
                                    {errors.genre && <p className="mt-1.5 text-sm text-destructive">{errors.genre}</p>}
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <label htmlFor="duration" className="block mb-1.5 text-sm font-medium text-foreground">
                                        Duration (minutes) <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        id="duration"
                                        type="number"
                                        value={data.duration}
                                        onChange={(e) => setData('duration', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md bg-background text-foreground border-input focus:border-primary focus:ring-primary/30 placeholder:text-muted-foreground ${errors.duration ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                            }`}
                                        required
                                    />
                                    {errors.duration && <p className="mt-1.5 text-sm text-destructive">{errors.duration}</p>}
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <label htmlFor="release_date" className="block mb-1.5 text-sm font-medium text-foreground">
                                        Release Date
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <input
                                            id="release_date"
                                            type="date"
                                            value={data.release_date}
                                            onChange={(e) => setData('release_date', e.target.value)}
                                            className={`w-full py-2 pl-10 pr-3 border rounded-md bg-background text-foreground border-input focus:border-primary focus:ring-primary/30 placeholder:text-muted-foreground ${errors.release_date ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                                }`}
                                        />
                                    </div>
                                    {errors.release_date && <p className="mt-1.5 text-sm text-destructive">{errors.release_date}</p>}
                                </motion.div>

                                <motion.div
                                    className="flex items-center h-full"
                                    whileHover={{ y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className="flex items-center space-x-2">
                                        <motion.input
                                            whileTap={{ scale: 0.9 }}
                                            type="checkbox"
                                            id="is_featured"
                                            checked={data.is_featured}
                                            onChange={(e) => setData('is_featured', e.target.checked)}
                                            className="w-5 h-5 rounded border-input focus:ring-primary/30 text-primary"
                                        />
                                        <label htmlFor="is_featured" className="text-sm font-medium text-foreground">
                                            Feature this film on homepage
                                        </label>
                                    </div>
                                </motion.div>
                            </motion.div>

                            <motion.div
                                variants={itemVariants}
                                whileHover={{ y: -5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <label htmlFor="description" className="block mb-1.5 text-sm font-medium text-foreground">
                                    Description <span className="text-destructive">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    rows={4}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md bg-background text-foreground border-input focus:border-primary focus:ring-primary/30 placeholder:text-muted-foreground ${errors.description ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                        }`}
                                    required
                                />
                                {errors.description && <p className="mt-1.5 text-sm text-destructive">{errors.description}</p>}
                            </motion.div>

                            <motion.div
                                className="p-6 border rounded-lg border-border"
                                variants={itemVariants}
                                whileHover={{ y: -5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <label className="block mb-3 text-sm font-medium text-foreground">Poster Image</label>

                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">Choose how to update the poster:</p>
                                        <div className="flex flex-col space-y-2">
                                            <div className="flex items-center">
                                                <input
                                                    id="poster_unchanged"
                                                    type="radio"
                                                    name="poster_type"
                                                    className="w-4 h-4 border-input text-primary focus:ring-primary"
                                                    checked={data.poster_type === 'unchanged'}
                                                    onChange={() => handlePosterTypeChange('unchanged')}
                                                />
                                                <label htmlFor="poster_unchanged" className="ml-2 text-sm text-foreground">
                                                    Keep current poster
                                                </label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    id="poster_file"
                                                    type="radio"
                                                    name="poster_type"
                                                    className="w-4 h-4 border-input text-primary focus:ring-primary"
                                                    checked={data.poster_type === 'file'}
                                                    onChange={() => handlePosterTypeChange('file')}
                                                />
                                                <label htmlFor="poster_file" className="ml-2 text-sm text-foreground">
                                                    Upload new image
                                                </label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    id="poster_url"
                                                    type="radio"
                                                    name="poster_type"
                                                    className="w-4 h-4 border-input text-primary focus:ring-primary"
                                                    checked={data.poster_type === 'url'}
                                                    onChange={() => handlePosterTypeChange('url')}
                                                />
                                                <label htmlFor="poster_url" className="ml-2 text-sm text-foreground">
                                                    Use image URL
                                                </label>
                                            </div>
                                        </div>

                                        {data.poster_type === 'file' && (
                                            <div className="mt-3">
                                                <input
                                                    type="file"
                                                    onChange={handlePosterChange}
                                                    accept="image/*"
                                                    className="w-full text-sm border rounded-md bg-background text-foreground border-input focus:outline-none"
                                                />
                                                {errors.poster_image && <p className="mt-1 text-sm text-destructive">{errors.poster_image}</p>}
                                            </div>
                                        )}

                                        {data.poster_type === 'url' && (
                                            <div className="mt-3">
                                                <input
                                                    type="url"
                                                    placeholder="https://example.com/poster.jpg"
                                                    value={data.poster_url}
                                                    onChange={handlePosterUrlChange}
                                                    className="w-full px-3 py-2 border rounded-md bg-background text-foreground border-input focus:border-primary focus:ring-primary/30 placeholder:text-muted-foreground"
                                                />
                                                {errors.poster_url && <p className="mt-1 text-sm text-destructive">{errors.poster_url}</p>}
                                            </div>
                                        )}
                                    </div>

                                    {posterPreview && (
                                        <motion.div
                                            className="flex items-center justify-center"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <div className="relative w-32 h-40 overflow-hidden rounded-md shadow-md">
                                                <img
                                                    src={posterPreview}
                                                    alt="Poster preview"
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Form actions */}
                            <motion.div
                                className="flex justify-end space-x-3 pt-6"
                                variants={itemVariants}
                            >
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link
                                        href={route('admin.films.show', { film: film.id })}
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
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </motion.button>
                            </motion.div>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AdminLayout>
    );
}
