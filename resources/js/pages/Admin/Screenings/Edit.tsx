import AdminLayout from '@/layouts/AdminLayout';
import { CalendarIcon } from '@heroicons/react/24/outline';
import ArrowLeftIcon from '@heroicons/react/24/outline/ArrowLeftIcon.js';
import FilmIcon from '@heroicons/react/24/outline/FilmIcon.js';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon.js';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon.js';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';
import { motion } from 'framer-motion';

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
    duration: number;
}

interface Screening {
    id: number;
    film_id: number;
    start_time: string;
    room: string;
    price: number;
    total_seats: number;
    is_active: boolean;
}

interface Props {
    screening: Screening;
    films: Film[];
}

export default function Edit({ screening, films }: Props) {
    const { data, setData, errors, put, processing } = useForm({
        film_id: screening.film_id.toString(),
        start_time: formatDateTimeLocal(screening.start_time),
        room: screening.room,
        price: screening.price.toString(),
        is_active: screening.is_active,
    });

    // Format date for datetime-local input
    function formatDateTimeLocal(dateString: string): string {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.screenings.update', { screening: screening.id }));
    };

    // Find the selected film
    const selectedFilm = films.find(film => film.id.toString() === data.film_id);

    return (
        <AdminLayout title="Edit Screening" subtitle="Modify screening details">
            <Head title="Edit Screening" />

            <motion.div
                className="container px-4 py-6 mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Back link */}
                <motion.div className="mb-6" variants={itemVariants}>
                    <Link
                        href={route('admin.screenings.show', { screening: screening.id })}
                        className="flex items-center text-sm transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-1" />
                        Back to Screening Details
                    </Link>
                </motion.div>

                {/* Header */}
                <motion.div className="flex flex-col mb-8 md:flex-row md:items-center md:justify-between" variants={itemVariants}>
                    <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-lg bg-primary/10">
                            <CalendarIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="mb-1 text-2xl font-bold text-foreground">Edit Screening</h1>
                            <p className="text-sm text-muted-foreground">Update screening information and details</p>
                        </div>
                    </div>
                </motion.div>

                {/* Main form */}
                <motion.div className="overflow-hidden border rounded-lg shadow-sm border-border bg-card" variants={itemVariants}>
                    <div className="px-6 py-4 border-b border-border bg-muted/30">
                        <h2 className="flex items-center text-lg font-medium text-foreground">
                            <FilmIcon className="w-5 h-5 mr-2 text-primary" />
                            Screening Information
                        </h2>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Film Selection */}
                            <motion.div
                                className="p-5 border rounded-lg border-border bg-muted/20"
                                variants={itemVariants}
                                whileHover={{ y: -5, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                transition={{ duration: 0.3 }}
                            >
                                <h3 className="mb-4 text-md font-medium text-foreground">Film Selection</h3>
                                <div>
                                    <label htmlFor="film_id" className="mb-1.5 block text-sm font-medium text-foreground">
                                        Select Film <span className="text-destructive">*</span>
                                    </label>
                                    <select
                                        id="film_id"
                                        value={data.film_id}
                                        onChange={(e) => setData('film_id', e.target.value)}
                                        className={`w-full rounded-md border px-3 py-2.5 bg-background text-foreground border-input focus:border-primary focus:ring-primary/30 placeholder:text-muted-foreground ${
                                            errors.film_id ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                        }`}
                                        required
                                    >
                                        <option value="">Select a film</option>
                                        {films.map((film) => (
                                            <option key={film.id} value={film.id}>
                                                {film.title} ({film.duration} min)
                                            </option>
                                        ))}
                                    </select>
                                    {errors.film_id && <p className="mt-1.5 text-sm text-destructive">{errors.film_id}</p>}
                                </div>

                                {selectedFilm && (
                                    <motion.div
                                        className="p-3 mt-4 border rounded-md border-border bg-muted/10"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-center">
                                            <FilmIcon className="w-5 h-5 mr-2 text-primary" />
                                            <span className="font-medium text-foreground">{selectedFilm.title}</span>
                                        </div>
                                        <div className="flex items-center mt-2 text-muted-foreground">
                                            <ClockIcon className="w-4 h-4 mr-1" />
                                            <span className="text-sm">Duration: {selectedFilm.duration} minutes</span>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>

                            {/* Time and Location */}
                            <motion.div
                                className="p-5 border rounded-lg border-border bg-muted/20"
                                variants={itemVariants}
                                whileHover={{ y: -5, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                transition={{ duration: 0.3 }}
                            >
                                <h3 className="mb-4 text-md font-medium text-foreground">Time and Location</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="start_time" className="mb-1.5 block text-sm font-medium text-foreground">
                                            Date & Time <span className="text-destructive">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <input
                                                id="start_time"
                                                type="datetime-local"
                                                value={data.start_time}
                                                onChange={(e) => setData('start_time', e.target.value)}
                                                className={`w-full rounded-md border py-2.5 pl-10 pr-3 bg-background text-foreground border-input focus:border-primary focus:ring-primary/30 placeholder:text-muted-foreground ${
                                                    errors.start_time ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                                }`}
                                                required
                                            />
                                        </div>
                                        {errors.start_time && <p className="mt-1.5 text-sm text-destructive">{errors.start_time}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="room" className="mb-1.5 block text-sm font-medium text-foreground">
                                            Room/Theater <span className="text-destructive">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <FilmIcon className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <input
                                                id="room"
                                                value={data.room}
                                                onChange={(e) => setData('room', e.target.value)}
                                                placeholder="e.g. Theater 1, IMAX, Screen A"
                                                className={`w-full rounded-md border py-2.5 pl-10 pr-3 bg-background text-foreground border-input focus:border-primary focus:ring-primary/30 placeholder:text-muted-foreground ${
                                                    errors.room ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                                }`}
                                                required
                                            />
                                        </div>
                                        {errors.room && <p className="mt-1.5 text-sm text-destructive">{errors.room}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-foreground">
                                            Ticket Price <span className="text-destructive">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <CurrencyDollarIcon className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <input
                                                id="price"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={data.price}
                                                onChange={(e) => setData('price', e.target.value)}
                                                placeholder="0.00"
                                                className={`w-full rounded-md border py-2.5 pl-10 pr-3 bg-background text-foreground border-input focus:border-primary focus:ring-primary/30 placeholder:text-muted-foreground ${
                                                    errors.price ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                                }`}
                                                required
                                            />
                                        </div>
                                        {errors.price && <p className="mt-1.5 text-sm text-destructive">{errors.price}</p>}
                                    </div>

                                    <div className="flex items-center p-3 border rounded-md border-border bg-muted/10">
                                        <motion.input
                                            whileTap={{ scale: 0.9 }}
                                            type="checkbox"
                                            id="is_active"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="w-5 h-5 rounded border-input focus:ring-primary/30 text-primary"
                                        />
                                        <label htmlFor="is_active" className="ml-2 text-sm text-foreground">
                                            Active (visible to customers)
                                        </label>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div className="p-5 border-t" variants={itemVariants}>
                                <p className="mb-6 text-sm text-muted-foreground">
                                    <strong>Note:</strong> Editing a screening will not affect existing reservations. You cannot modify the seating layout
                                    after creation.
                                </p>

                                <div className="flex justify-end space-x-3">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Link
                                            href={route('admin.screenings.show', { screening: screening.id })}
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium transition border rounded-md border-border text-foreground hover:bg-muted"
                                        >
                                            Cancel
                                        </Link>
                                    </motion.div>
                                    <motion.button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium transition shadow-sm text-white bg-primary hover:bg-primary/90 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </motion.button>
                                </div>
                            </motion.div>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AdminLayout>
    );
}
