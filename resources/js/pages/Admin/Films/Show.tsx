import AdminLayout from '@/layouts/AdminLayout';
import { CalendarIcon, ClockIcon, FilmIcon, PencilIcon, UserIcon } from '@heroicons/react/24/outline';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import React from 'react';

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
    poster_image: string;
    genre: string;
    release_date: string;
    director: string;
    is_featured: boolean;
    screenings_count: number;
    future_screenings_count: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    film: Film;
}

export default function Show({ film }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AdminLayout title={film.title} subtitle="Film Details">
            <Head title={`Film: ${film.title}`} />

            <motion.div
                className="container px-4 py-6 mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header with back and edit buttons */}
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
                            <h1 className="text-2xl font-bold text-foreground">{film.title}</h1>
                            <p className="text-sm text-muted-foreground">Film ID: {film.id}</p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link
                                href={route('admin.films.index')}
                                className="flex items-center px-4 py-2 text-sm font-medium transition border rounded-md border-border text-foreground hover:bg-muted"
                            >
                                Back to Films
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link
                                href={route('admin.films.edit', { film: film.id })}
                                className="flex items-center px-4 py-2 text-sm font-medium text-white transition rounded-md bg-primary hover:bg-primary/90"
                            >
                                <PencilIcon className="w-4 h-4 mr-2" />
                                Edit Film
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Film details */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Poster and basic info */}
                    <motion.div
                        className="col-span-1 overflow-hidden border rounded-lg shadow-sm border-border bg-card"
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="p-6">
                            <div className="flex flex-col items-center mb-4 space-y-4">
                                <motion.div
                                    className="overflow-hidden border rounded-lg shadow-md border-border h-auto w-full max-w-[250px]"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <img
                                        src={
                                            film.poster_image
                                                ? film.poster_image.startsWith('http')
                                                    ? film.poster_image
                                                    : `/storage/${film.poster_image}`
                                                : '/images/placeholder.png'
                                        }
                                        alt={film.title}
                                        className="object-cover w-full h-full"
                                    />
                                </motion.div>

                                {film.is_featured && (
                                    <motion.span
                                        className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-success/20 text-success"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.5, type: "spring" }}
                                    >
                                        Featured Film
                                    </motion.span>
                                )}
                            </div>

                            <div className="pt-4 border-t border-border">
                                <h3 className="mb-4 text-lg font-medium text-foreground">Quick Info</h3>
                                <ul className="space-y-3">
                                    <motion.li
                                        className="flex items-center"
                                        whileHover={{ x: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <UserIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Director: </span>
                                        <span className="ml-1 text-sm font-medium text-foreground">{film.director}</span>
                                    </motion.li>
                                    <motion.li
                                        className="flex items-center"
                                        whileHover={{ x: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Released: </span>
                                        <span className="ml-1 text-sm font-medium text-foreground">{formatDate(film.release_date)}</span>
                                    </motion.li>
                                    <motion.li
                                        className="flex items-center"
                                        whileHover={{ x: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <ClockIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Duration: </span>
                                        <span className="ml-1 text-sm font-medium text-foreground">{film.duration} minutes</span>
                                    </motion.li>
                                    <motion.li
                                        className="flex items-center"
                                        whileHover={{ x: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <FilmIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Genre: </span>
                                        <motion.span
                                            className="inline-flex px-2 py-0.5 ml-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            {film.genre}
                                        </motion.span>
                                    </motion.li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>

                    {/* Details and screenings */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Description */}
                        <motion.div
                            className="overflow-hidden border rounded-lg shadow-sm border-border bg-card"
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="p-4 border-b border-border">
                                <h3 className="font-medium text-foreground">Description</h3>
                            </div>
                            <div className="p-6">
                                <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">{film.description}</p>
                            </div>
                        </motion.div>

                        {/* Screenings stats */}
                        <motion.div
                            className="overflow-hidden border rounded-lg shadow-sm border-border bg-card"
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="p-4 border-b border-border">
                                <h3 className="font-medium text-foreground">Screenings Information</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <motion.div
                                        className="p-4 border rounded-lg bg-muted/30 border-border"
                                        whileHover={{ scale: 1.03 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <div className="mb-1 text-sm text-muted-foreground">Total Screenings</div>
                                        <div className="text-2xl font-bold text-foreground">{film.screenings_count}</div>
                                    </motion.div>
                                    <motion.div
                                        className="p-4 border rounded-lg bg-primary/10 border-border"
                                        whileHover={{ scale: 1.03 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <div className="mb-1 text-sm text-muted-foreground">Upcoming Screenings</div>
                                        <div className="text-2xl font-bold text-primary">{film.future_screenings_count}</div>
                                    </motion.div>
                                </div>

                                <div className="mt-4">
                                    <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                                        <Link
                                            href={route('admin.screenings.index', { film_id: film.id })}
                                            className="inline-flex items-center text-sm text-primary hover:text-primary/90"
                                        >
                                            <CalendarIcon className="w-4 h-4 mr-1" />
                                            View all screenings for this film
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Metadata */}
                        <motion.div
                            className="overflow-hidden border rounded-lg shadow-sm border-border bg-card"
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="p-4 border-b border-border">
                                <h3 className="font-medium text-foreground">Metadata</h3>
                            </div>
                            <div className="divide-y divide-border">
                                <motion.div
                                    className="grid grid-cols-2 p-4"
                                    whileHover={{ backgroundColor: "rgba(var(--primary), 0.05)" }}
                                >
                                    <div className="text-sm text-muted-foreground">Created</div>
                                    <div className="text-sm text-foreground">{formatDate(film.created_at)}</div>
                                </motion.div>
                                <motion.div
                                    className="grid grid-cols-2 p-4"
                                    whileHover={{ backgroundColor: "rgba(var(--primary), 0.05)" }}
                                >
                                    <div className="text-sm text-muted-foreground">Last Updated</div>
                                    <div className="text-sm text-foreground">{formatDate(film.updated_at)}</div>
                                </motion.div>
                                <motion.div
                                    className="grid grid-cols-2 p-4"
                                    whileHover={{ backgroundColor: "rgba(var(--primary), 0.05)" }}
                                >
                                    <div className="text-sm text-muted-foreground">Film ID</div>
                                    <div className="text-sm text-foreground">{film.id}</div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </AdminLayout>
    );
}
