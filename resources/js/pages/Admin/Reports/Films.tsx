import AdminLayout from '@/layouts/AdminLayout';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon.js';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon.js';
import CreditCardIcon from '@heroicons/react/24/outline/CreditCardIcon.js';
import FilmIcon from '@heroicons/react/24/outline/FilmIcon.js';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon.js';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useRef } from 'react';

interface Film {
    id: number;
    title: string;
    poster_image: string | null;
    release_date: string;
    duration: number;
    director: string;
    genre: string;
    reservations_count: number;
}

interface Props {
    films: {
        data: Film[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
        current_page: number;
        last_page: number;
    };
    period: string;
    filters: {
        search?: string;
    };
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            when: 'beforeChildren',
            staggerChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24
        }
    }
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 250,
            damping: 20
        }
    }
};

export default function Films({ films, period, filters }: Props) {
    const { data, setData, get } = useForm({
        search: filters.search || '',
        period: period,
    });

    // Reference to track previous filter state
    const prevFiltersRef = useRef({ search: filters.search || '', period });

    // Use React's useEffect to trigger filtering when form data changes
    useEffect(() => {
        // Don't run on initial mount
        if (prevFiltersRef.current.search !== data.search) {
            const timeoutId = setTimeout(() => {
                get(route('admin.reports.films'), {
                    preserveState: true,
                    replace: true,
                });
            }, 300);

            // Update previous filters reference
            prevFiltersRef.current = { ...prevFiltersRef.current, search: data.search };

            // Clean up timeout on unmount or before next effect run
            return () => clearTimeout(timeoutId);
        }
    }, [data.search]);

    const handlePeriodChange = (period: string) => {
        setData('period', period);
        // Update previous filters reference
        prevFiltersRef.current = { ...prevFiltersRef.current, period };

        // No need to debounce period changes - apply immediately
        get(route('admin.reports.films'), {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AdminLayout title="Film Popularity Report" subtitle="Monitor which films are attracting most attendance">
            <Head title="Film Popularity Report" />

            {/* Report Navigation */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-6 border rounded-lg shadow-sm border-border bg-card"
            >
                <div className="flex overflow-x-auto">
                    <Link
                        href={route('admin.reports.films')}
                        className="flex items-center px-6 py-3 text-sm font-medium border-b-2 border-primary text-primary"
                    >
                        <FilmIcon className="w-5 h-5 mr-2" />
                        Film Popularity
                    </Link>
                    <Link
                        href={route('admin.reports.revenue')}
                        className="flex items-center px-6 py-3 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground"
                    >
                        <CreditCardIcon className="w-5 h-5 mr-2" />
                        Revenue
                    </Link>
                    <Link
                        href={route('admin.reports.screenings')}
                        className="flex items-center px-6 py-3 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground"
                    >
                        <CalendarIcon className="w-5 h-5 mr-2" />
                        Screening Occupancy
                    </Link>
                </div>
            </motion.div>

            {/* Header with actions */}
            <motion.div
                className="flex items-center justify-between mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <div className="flex items-center">
                    <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                        className="flex items-center justify-center w-10 h-10 mr-2 rounded-lg bg-primary/10"
                    >
                        <ChartBarIcon className="w-6 h-6 text-primary" />
                    </motion.div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Film Popularity</h2>
                        <p className="text-sm text-muted-foreground">
                            Based on {data.period === 'week' ? 'last week' :
                                data.period === 'month' ? 'last month' :
                                    data.period === 'quarter' ? 'last quarter' :
                                        data.period === 'year' ? 'last year' : 'all time'} reservation data
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Period filter */}
            <motion.div
                className="p-4 mb-6 border rounded-lg shadow-sm border-border bg-card"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex flex-wrap gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400 }}
                                onClick={() => handlePeriodChange('week')}
                                className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${data.period === 'week'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                Last Week
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400 }}
                                onClick={() => handlePeriodChange('month')}
                                className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${data.period === 'month'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                Last Month
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400 }}
                                onClick={() => handlePeriodChange('quarter')}
                                className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${data.period === 'quarter'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                Last Quarter
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400 }}
                                onClick={() => handlePeriodChange('year')}
                                className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${data.period === 'year'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                Last Year
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400 }}
                                onClick={() => handlePeriodChange('all')}
                                className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${data.period === 'all'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                All Time
                            </motion.button>
                        </div>
                    </div>
                    <div>
                        <div className="relative max-w-xs">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <MagnifyingGlassIcon className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                            </div>
                            <motion.input
                                whileFocus={{ scale: 1.02, boxShadow: "0 0 0 2px var(--primary)" }}
                                transition={{ duration: 0.2 }}
                                type="text"
                                placeholder="Search films..."
                                value={data.search}
                                onChange={(e) => setData('search', e.target.value)}
                                className="block w-full py-2 pl-10 pr-3 border rounded-md shadow-sm focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground sm:text-sm"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Films list */}
            <motion.div
                className="overflow-hidden transition-shadow rounded-lg shadow-md hover:shadow-lg"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.005 }}
                transition={{ duration: 0.3 }}
            >
                <div className="overflow-x-auto border border-border bg-card">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Rank
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Film
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Director
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Genre
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Duration
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Reservations
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                            <AnimatePresence>
                                {films.data.length > 0 ? (
                                    films.data.map((film, index) => (
                                        <motion.tr
                                            key={film.id}
                                            className="transition-colors hover:bg-muted/40"
                                            variants={itemVariants}
                                            custom={index}
                                            whileHover={{
                                                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                                transition: { duration: 0.2 }
                                            }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <motion.div
                                                    className="flex items-center justify-center w-8 h-8 text-sm font-bold rounded-full bg-primary/10 text-primary"
                                                    whileHover={{ scale: 1.2, rotate: 5 }}
                                                    transition={{ type: "spring", stiffness: 400 }}
                                                >
                                                    {index + 1}
                                                </motion.div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 w-10 overflow-hidden border rounded-md shadow-sm h-14 border-border">
                                                        <motion.img
                                                            whileHover={{ scale: 1.2 }}
                                                            transition={{ type: "spring", stiffness: 300 }}
                                                            className="object-cover w-full h-full"
                                                            src={
                                                                film.poster_image
                                                                    ? film.poster_image.startsWith('http')
                                                                        ? film.poster_image
                                                                        : `/storage/${film.poster_image}`
                                                                    : '/images/placeholder.png'
                                                            }
                                                            alt={film.title}
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-foreground">{film.title}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {new Date(film.release_date).getFullYear()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                                                {film.director}
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                <motion.span
                                                    className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary"
                                                    whileHover={{ scale: 1.1, backgroundColor: "rgba(var(--primary), 0.2)" }}
                                                    transition={{ type: "spring", stiffness: 400 }}
                                                >
                                                    {film.genre}
                                                </motion.span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">{film.duration} min</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-20 h-2 mr-2 overflow-hidden rounded-full bg-muted">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{
                                                                width: `${Math.min(100, (film.reservations_count / (films.data[0]?.reservations_count || 1)) * 100)}%`
                                                            }}
                                                            transition={{ duration: 0.8, delay: index * 0.1 }}
                                                            className="h-full bg-primary"
                                                        />
                                                    </div>
                                                    <span className="text-foreground">{film.reservations_count}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <Link
                                                        href={route('admin.films.show', { film: film.id })}
                                                        className="transition text-primary hover:text-primary/80"
                                                    >
                                                        View Details
                                                    </Link>
                                                </motion.div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3, delay: 0.2 }}
                                    >
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <motion.div
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                                                >
                                                    <FilmIcon className="w-12 h-12 mb-3 text-muted-foreground" />
                                                </motion.div>
                                                <motion.h3
                                                    className="mb-1 text-lg font-medium text-foreground"
                                                    initial={{ y: 10, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    transition={{ delay: 0.4 }}
                                                >
                                                    No data available
                                                </motion.h3>
                                                <motion.p
                                                    className="text-sm text-muted-foreground"
                                                    initial={{ y: 10, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    transition={{ delay: 0.5 }}
                                                >
                                                    {data.search
                                                        ? 'No films match your search criteria'
                                                        : 'No reservation data available for the selected period'}
                                                </motion.p>
                                            </div>
                                        </td>
                                    </motion.tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Extra information card */}
            {films.data.length > 0 && (
                <motion.div
                    className="p-6 mt-6 border rounded-lg shadow-sm border-border bg-card"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.5, delay: 0.6 }}
                    whileHover={{
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        y: -5
                    }}
                >
                    <div className="flex items-center mb-4">
                        <motion.div
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <ChartBarIcon className="w-5 h-5 text-primary" />
                        </motion.div>
                        <h3 className="ml-3 text-lg font-medium text-foreground">Report Insights</h3>
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">
                        This report shows the most popular films based on reservation counts during the selected period.
                        Use this data to inform programming decisions and marketing strategies.
                    </p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <motion.div
                            className="p-4 border rounded-md border-border"
                            whileHover={{ scale: 1.03, backgroundColor: "rgba(var(--primary), 0.05)" }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <h4 className="text-sm font-medium text-muted-foreground">Total Films</h4>
                            <p className="text-2xl font-bold text-foreground">{films.total}</p>
                        </motion.div>
                        <motion.div
                            className="p-4 border rounded-md border-border"
                            whileHover={{ scale: 1.03, backgroundColor: "rgba(var(--primary), 0.05)" }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <h4 className="text-sm font-medium text-muted-foreground">Most Popular</h4>
                            <p className="text-2xl font-bold text-foreground">{films.data[0]?.title || '-'}</p>
                        </motion.div>
                        <motion.div
                            className="p-4 border rounded-md border-border"
                            whileHover={{ scale: 1.03, backgroundColor: "rgba(var(--primary), 0.05)" }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <h4 className="text-sm font-medium text-muted-foreground">Total Reservations</h4>
                            <p className="text-2xl font-bold text-foreground">
                                {films.data.reduce((sum, film) => sum + film.reservations_count, 0)}
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AdminLayout>
    );
}
