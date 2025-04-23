import AdminLayout from '@/layouts/AdminLayout';
import { CalendarIcon, ChartBarIcon, CreditCardIcon, FilmIcon } from '@heroicons/react/24/outline';
import { Head, Link, useForm } from '@inertiajs/react';
import Chart from 'chart.js/auto';
import { motion } from 'framer-motion';
import React, { useEffect, useRef } from 'react';

interface Film {
    id: number;
    title: string;
}

interface FilmRevenue {
    id: number;
    title: string;
    revenue: number;
    count: number;
}

interface DailyRevenue {
    date: string;
    revenue: string;
}

interface Props {
    dailyRevenue: DailyRevenue[];
    filmRevenue: FilmRevenue[];
    totalRevenue: number;
    films: Film[];
    period: string;
    filters: {
        film_id?: string;
    };
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
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

export default function Revenue({ dailyRevenue, filmRevenue, totalRevenue, films, period, filters }: Props) {
    const { data, setData, get } = useForm({
        film_id: filters.film_id || '',
        period: period,
    });

    // Reference to track previous filter state
    const prevFiltersRef = useRef({ film_id: filters.film_id || '', period });

    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    // Add useEffect for automatic filter application when film selection changes
    useEffect(() => {
        // Don't run on initial mount
        if (prevFiltersRef.current.film_id !== data.film_id) {
            // Get the film ID ready for the query
            let filmIdParam = data.film_id;

            // For empty value (All Films), pass null instead of empty string
            if (filmIdParam === '') {
                filmIdParam = null;
            }

            // Make the request
            get(route('admin.reports.revenue'), {
                data: {
                    film_id: filmIdParam,
                    period: data.period
                },
                preserveState: true,
                replace: true,
            });

            // Update previous filters reference
            prevFiltersRef.current = { ...prevFiltersRef.current, film_id: data.film_id };
        }
    }, [data.film_id]);

    useEffect(() => {
        if (chartRef.current) {
            // Destroy previous chart if it exists
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            const dates = dailyRevenue.map((item) => {
                const date = new Date(item.date);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });

            const revenues = dailyRevenue.map((item) => parseFloat(item.revenue));

            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                chartInstance.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: dates,
                        datasets: [
                            {
                                label: 'Daily Revenue',
                                data: revenues,
                                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                                borderColor: 'rgba(79, 70, 229, 1)',
                                borderWidth: 2,
                                tension: 0.3,
                                fill: true,
                                pointBackgroundColor: 'rgba(79, 70, 229, 1)',
                                pointRadius: 3,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function (value) {
                                        return '$' + value.toLocaleString();
                                    },
                                },
                                title: {
                                    display: true,
                                    text: 'Revenue',
                                },
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Date',
                                },
                            },
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        return (
                                            'Revenue: $' +
                                            context.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                        );
                                    },
                                },
                            },
                        },
                    },
                });
            }
        }
    }, [dailyRevenue]);

    const handlePeriodChange = (period: string) => {
        setData('period', period);
        // Update previous filters reference
        prevFiltersRef.current = { ...prevFiltersRef.current, period };

        // Get the film ID ready for the query
        let filmIdParam = data.film_id;

        // For empty value (All Films), pass null instead of empty string
        if (filmIdParam === '') {
            filmIdParam = null;
        }

        // Make the request
        get(route('admin.reports.revenue'), {
            data: {
                film_id: filmIdParam,
                period: period
            },
            preserveState: true,
            replace: true,
        });
    };

    // This function is no longer needed as the useEffect handles changes
    // but we'll keep it for reference and compatibility
    const handleFilmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData('film_id', e.target.value);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    // Calculate transaction count and average from filmRevenue
    const transactionCount = filmRevenue.reduce((acc, item) => acc + item.count, 0);

    // Calculate average transaction safely (avoid division by zero)
    const avgTransaction = transactionCount > 0
        ? totalRevenue / transactionCount
        : 0;

    return (
        <AdminLayout title="Revenue Report" subtitle="Track your cinema's financial performance">
            <Head title="Revenue Report" />

            {/* Report Navigation */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 border rounded-lg shadow-sm border-border bg-card"
            >
                <div className="flex overflow-x-auto">
                    <Link
                        href={route('admin.reports.films')}
                        className="flex items-center px-6 py-3 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground"
                    >
                        <FilmIcon className="w-5 h-5 mr-2" />
                        Film Popularity
                    </Link>
                    <Link
                        href={route('admin.reports.revenue')}
                        className="flex items-center px-6 py-3 text-sm font-medium border-b-2 border-primary text-primary"
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
                        whileHover={{ rotate: 10 }}
                        className="flex items-center justify-center w-10 h-10 mr-2 rounded-lg bg-primary/10"
                    >
                        <CreditCardIcon className="w-6 h-6 text-primary" />
                    </motion.div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Revenue Analysis</h2>
                        <p className="text-sm text-muted-foreground">
                            Based on {data.period === 'week' ? 'last week' :
                                    data.period === 'month' ? 'last month' :
                                    data.period === 'quarter' ? 'last quarter' :
                                    data.period === 'year' ? 'last year' : 'all time'} financial data
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Period & Film Filter */}
            <motion.div
                className="p-4 mb-6 border rounded-lg shadow-sm border-border bg-card"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex flex-wrap gap-2">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handlePeriodChange('week')}
                                className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${
                                    data.period === 'week'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                            >
                                Last Week
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handlePeriodChange('month')}
                                className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${
                                    data.period === 'month'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                            >
                                Last Month
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handlePeriodChange('quarter')}
                                className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${
                                    data.period === 'quarter'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                            >
                                Last Quarter
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handlePeriodChange('year')}
                                className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${
                                    data.period === 'year'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                            >
                                Last Year
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handlePeriodChange('all')}
                                className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${
                                    data.period === 'all'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                            >
                                All Time
                            </motion.button>
                        </div>
                    </div>
                    <div className="w-full md:w-64">
                        <motion.select
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                            id="film_id"
                            value={data.film_id}
                            onChange={handleFilmChange}
                            className="w-full px-3 py-2 border rounded-md shadow-sm focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground"
                        >
                            <option value="">All Films</option>
                            {films.map((film) => (
                                <option key={film.id} value={film.id}>
                                    {film.title}
                                </option>
                            ))}
                        </motion.select>
                    </div>
                </div>
            </motion.div>

            {/* Key Figures */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3"
            >
                <motion.div
                    variants={itemVariants}
                    className="p-6 overflow-hidden transition-shadow border rounded-lg shadow-sm hover:shadow-md border-border bg-card"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="mb-1 text-sm font-medium text-muted-foreground">Total Revenue</p>
                            <h4 className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</h4>
                        </div>
                        <motion.div
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary"
                        >
                            <CreditCardIcon className="w-6 h-6" />
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="p-6 overflow-hidden transition-shadow border rounded-lg shadow-sm hover:shadow-md border-border bg-card"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="mb-1 text-sm font-medium text-muted-foreground">Total Transactions</p>
                            <h4 className="text-2xl font-bold text-foreground">{transactionCount}</h4>
                        </div>
                        <motion.div
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
                                />
                            </svg>
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="p-6 overflow-hidden transition-shadow border rounded-lg shadow-sm hover:shadow-md border-border bg-card"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="mb-1 text-sm font-medium text-muted-foreground">Avg. Transaction</p>
                            <h4 className="text-2xl font-bold text-foreground">
                                {formatCurrency(avgTransaction)}
                            </h4>
                        </div>
                        <motion.div
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary"
                        >
                            <ChartBarIcon className="w-6 h-6" />
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Revenue Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-6 overflow-hidden transition-shadow border rounded-lg shadow-sm hover:shadow-md border-border bg-card h-80"
            >
                <div className="px-6 py-4 border-b border-border bg-muted">
                    <h3 className="text-lg font-medium text-foreground">Daily Revenue</h3>
                </div>
                <div className="h-[calc(100%-4rem)] p-6">
                    <canvas ref={chartRef}></canvas>
                </div>
            </motion.div>

            {/* Revenue by Film */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="overflow-hidden transition-shadow border rounded-lg shadow-sm hover:shadow-md border-border bg-card"
            >
                <div className="px-6 py-4 border-b border-border bg-muted">
                    <h3 className="text-lg font-medium text-foreground">Revenue by Film</h3>
                </div>
                <div className="px-6 py-2">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-transparent">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground"
                                    >
                                        Film
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground"
                                    >
                                        Transactions
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground"
                                    >
                                        Revenue
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground"
                                    >
                                        % of Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filmRevenue.length > 0 ? (
                                    filmRevenue.map((item, index) => (
                                        <motion.tr
                                            key={item.id}
                                            className="transition-colors hover:bg-muted/40"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: 0.05 * index }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <motion.div
                                                        whileHover={{ scale: 1.2, rotate: 5 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <FilmIcon className="w-5 h-5 mr-2 text-primary" />
                                                    </motion.div>
                                                    <div className="text-sm font-medium text-foreground">{item.title}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">{item.count}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-foreground whitespace-nowrap">
                                                {formatCurrency(item.revenue)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className="mr-2 text-sm text-foreground">
                                                        {((item.revenue / totalRevenue) * 100).toFixed(1)}%
                                                    </span>
                                                    <div className="w-32 h-2 mr-2 overflow-hidden rounded-full bg-muted">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(item.revenue / totalRevenue) * 100}%` }}
                                                            transition={{ duration: 0.8, delay: index * 0.1 }}
                                                            className="h-full bg-primary"
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <motion.div
                                                    initial={{ scale: 0.5, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ duration: 0.5 }}
                                                >
                                                    <CreditCardIcon className="w-12 h-12 mb-4 text-muted-foreground" />
                                                </motion.div>
                                                <p className="text-sm text-muted-foreground">No revenue data available for this period.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        </AdminLayout>
    );
}
