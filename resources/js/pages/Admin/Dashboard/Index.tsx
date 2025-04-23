import AdminLayout from '@/layouts/AdminLayout';
import {
    ArrowDownCircle as ArrowDownCircleIcon,
    ArrowUpCircle as ArrowUpCircleIcon,
    Calendar as CalendarIcon,
    ChartBar as ChartBarIcon,
    Clock as ClockIcon,
    CreditCard as CreditCardIcon,
    Film as FilmIcon,
    Ticket as TicketIcon,
    User as UserIcon,
} from 'lucide-react';
import { Head, Link } from '@inertiajs/react';
import Chart from 'chart.js/auto';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface DashboardProps {
    stats: {
        films_count: number;
        screenings_count: number;
        reservations_count: number;
        revenue: number;
        recent_growth: {
            films: number;
            screenings: number;
            reservations: number;
            revenue: number;
        };
    };
    upcomingScreenings: Array<{
        id: number;
        start_time: string;
        room: string;
        film: {
            id: number;
            title: string;
        };
    }>;
    recentReservations: Array<{
        id: number;
        reservation_code: string;
        status: string;
        created_at: string;
        screening: {
            id: number;
            start_time: string;
            film: {
                id: number;
                title: string;
            };
        };
        user?: {
            id: number;
            name: string;
            email: string;
        };
        guest_name?: string;
        guest_email?: string;
    }>;
    popularFilms: Array<{
        id: number;
        title: string;
        reservations_count: number;
    }>;
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
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

export default function Dashboard({ stats, upcomingScreenings, recentReservations, popularFilms }: DashboardProps) {
    const popularFilmsChartRef = useRef<HTMLCanvasElement>(null);
    const revenueChartRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        // Popular Films Chart
        if (popularFilmsChartRef.current) {
            const ctx = popularFilmsChartRef.current.getContext('2d');
            if (ctx) {
                const chart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: popularFilms.map((film) => (film.title.length > 15 ? film.title.substring(0, 15) + '...' : film.title)),
                        datasets: [
                            {
                                label: 'Reservations',
                                data: popularFilms.map((film) => film.reservations_count),
                                backgroundColor: 'rgba(79, 70, 229, 0.7)',
                                borderColor: 'rgba(79, 70, 229, 1)',
                                borderWidth: 1,
                                borderRadius: 6,
                                barThickness: 20,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false,
                            },
                            tooltip: {
                                callbacks: {
                                    title: (tooltipItems) => {
                                        const index = tooltipItems[0].dataIndex;
                                        return popularFilms[index].title;
                                    },
                                },
                            },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: {
                                    display: true,
                                    color: 'rgba(0, 0, 0, 0.05)',
                                },
                                ticks: {
                                    precision: 0,
                                },
                            },
                            x: {
                                grid: {
                                    display: false,
                                },
                            },
                        },
                    },
                });

                return () => {
                    chart.destroy();
                };
            }
        }
    }, [popularFilms]);

    useEffect(() => {
        // Monthly Revenue Chart (Mockup data)
        if (revenueChartRef.current) {
            const ctx = revenueChartRef.current.getContext('2d');
            if (ctx) {
                // Mock data - in a real app this would come from the backend
                const monthlyRevenue = [
                    { month: 'Jan', revenue: stats.revenue * 0.4 },
                    { month: 'Feb', revenue: stats.revenue * 0.5 },
                    { month: 'Mar', revenue: stats.revenue * 0.7 },
                    { month: 'Apr', revenue: stats.revenue * 0.6 },
                    { month: 'May', revenue: stats.revenue * 0.8 },
                    { month: 'Jun', revenue: stats.revenue * 0.9 },
                    { month: 'Jul', revenue: stats.revenue * 1.0 },
                ];

                const chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: monthlyRevenue.map((item) => item.month),
                        datasets: [
                            {
                                label: 'Revenue',
                                data: monthlyRevenue.map((item) => item.revenue),
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                borderColor: 'rgba(16, 185, 129, 1)',
                                borderWidth: 2,
                                tension: 0.3,
                                fill: true,
                                pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                                pointRadius: 4,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false,
                            },
                            tooltip: {
                                callbacks: {
                                    label: (context: { raw: number }) => {
                                        return `Revenue: $${context.raw.toFixed(2)}`;
                                    },
                                },
                            },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: {
                                    display: true,
                                    color: 'rgba(0, 0, 0, 0.05)',
                                },
                                ticks: {
                                    callback: function (value) {
                                        return '$' + value.toLocaleString();
                                    },
                                },
                            },
                            x: {
                                grid: {
                                    display: false,
                                },
                            },
                        },
                    },
                });

                return () => {
                    chart.destroy();
                };
            }
        }
    }, [stats.revenue]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-success/20 text-success';
            case 'pending':
                return 'bg-warning/20 text-warning';
            case 'cancelled':
                return 'bg-destructive/20 text-destructive';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    const getGrowthIcon = (value: number) => {
        if (value > 0) {
            return <ArrowUpCircleIcon className="w-5 h-5 text-success" />;
        } else if (value < 0) {
            return <ArrowDownCircleIcon className="w-5 h-5 text-destructive" />;
        }
        return null;
    };

    return (
        <AdminLayout title="Cinema Dashboard" subtitle="Overview of your cinema's performance">
            <Head title="Admin Dashboard" />

            {/* Stats Cards */}
            <motion.div
                className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div
                    variants={itemVariants}
                    className="overflow-hidden transition-shadow border rounded-lg shadow-sm border-border bg-card hover:shadow-md"
                    whileHover={{ scale: 1.01 }}
                >
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Films</p>
                                <div className="flex items-center mt-1 space-x-1">
                                    <h3 className="text-2xl font-bold text-foreground">{stats.films_count}</h3>
                                    {stats.recent_growth?.films !== undefined && (
                                        <div className="flex items-center ml-2 text-xs">
                                            {getGrowthIcon(stats.recent_growth.films)}
                                            <span className={stats.recent_growth.films > 0 ? 'text-success' : 'text-destructive'}>
                                                {Math.abs(stats.recent_growth.films)}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">Total films in catalog</p>
                            </div>
                            <motion.div
                                className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary"
                                whileHover={{ rotate: 15 }}
                            >
                                <FilmIcon className="w-6 h-6" />
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="overflow-hidden transition-shadow border rounded-lg shadow-sm border-border bg-card hover:shadow-md"
                    whileHover={{ scale: 1.01 }}
                >
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Screenings</p>
                                <div className="flex items-center mt-1 space-x-1">
                                    <h3 className="text-2xl font-bold text-foreground">{stats.screenings_count}</h3>
                                    {stats.recent_growth?.screenings !== undefined && (
                                        <div className="flex items-center ml-2 text-xs">
                                            {getGrowthIcon(stats.recent_growth.screenings)}
                                            <span className={stats.recent_growth.screenings > 0 ? 'text-success' : 'text-destructive'}>
                                                {Math.abs(stats.recent_growth.screenings)}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">Total scheduled screenings</p>
                            </div>
                            <motion.div
                                className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary"
                                whileHover={{ rotate: 15 }}
                            >
                                <CalendarIcon className="w-6 h-6" />
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="overflow-hidden transition-shadow border rounded-lg shadow-sm border-border bg-card hover:shadow-md"
                    whileHover={{ scale: 1.01 }}
                >
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Reservations</p>
                                <div className="flex items-center mt-1 space-x-1">
                                    <h3 className="text-2xl font-bold text-foreground">{stats.reservations_count}</h3>
                                    {stats.recent_growth?.reservations !== undefined && (
                                        <div className="flex items-center ml-2 text-xs">
                                            {getGrowthIcon(stats.recent_growth.reservations)}
                                            <span className={stats.recent_growth.reservations > 0 ? 'text-success' : 'text-destructive'}>
                                                {Math.abs(stats.recent_growth.reservations)}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">Total customer bookings</p>
                            </div>
                            <motion.div
                                className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary"
                                whileHover={{ rotate: 15 }}
                            >
                                <TicketIcon className="w-6 h-6" />
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="overflow-hidden transition-shadow border rounded-lg shadow-sm border-border bg-card hover:shadow-md"
                    whileHover={{ scale: 1.01 }}
                >
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                                <div className="flex items-center mt-1 space-x-1">
                                    <h3 className="text-2xl font-bold text-foreground">{formatCurrency(stats.revenue)}</h3>
                                    {stats.recent_growth?.revenue !== undefined && (
                                        <div className="flex items-center ml-2 text-xs">
                                            {getGrowthIcon(stats.recent_growth.revenue)}
                                            <span className={stats.recent_growth.revenue > 0 ? 'text-success' : 'text-destructive'}>
                                                {Math.abs(stats.recent_growth.revenue)}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">Total earnings</p>
                            </div>
                            <motion.div
                                className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary"
                                whileHover={{ rotate: 15 }}
                            >
                                <CreditCardIcon className="w-6 h-6" />
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Charts & Upcoming Screenings */}
            <motion.div
                className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
            >
                {/* Popular Films Chart */}
                <motion.div
                    variants={itemVariants}
                    className="overflow-hidden transition-shadow border rounded-lg shadow-sm border-border bg-card hover:shadow-md"
                >
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted">
                        <h3 className="flex items-center text-lg font-medium text-foreground">
                            <ChartBarIcon className="w-5 h-5 mr-2 text-primary" />
                            Popular Films
                        </h3>
                        <motion.div whileHover={{ x: 2 }}>
                            <Link href={route('admin.reports.films')} className="text-sm font-medium text-primary hover:text-primary/90">
                            View Report
                        </Link>
                        </motion.div>
                    </div>
                    <div className="p-6">
                        <div className="h-[240px] w-full">
                            <canvas ref={popularFilmsChartRef}></canvas>
                        </div>
                    </div>
                </motion.div>

                {/* Revenue Chart */}
                <motion.div
                    variants={itemVariants}
                    className="overflow-hidden transition-shadow border rounded-lg shadow-sm border-border bg-card hover:shadow-md"
                >
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted">
                        <h3 className="flex items-center text-lg font-medium text-foreground">
                            <CreditCardIcon className="w-5 h-5 mr-2 text-primary" />
                            Monthly Revenue
                        </h3>
                        <motion.div whileHover={{ x: 2 }}>
                            <Link href={route('admin.reports.revenue')} className="text-sm font-medium text-primary hover:text-primary/90">
                            View Report
                        </Link>
                        </motion.div>
                    </div>
                    <div className="p-6">
                        <div className="h-[240px] w-full">
                            <canvas ref={revenueChartRef}></canvas>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            <motion.div
                className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.5 }}
            >
                {/* Recent Reservations */}
                <motion.div
                    variants={itemVariants}
                    className="overflow-hidden transition-shadow border rounded-lg shadow-sm border-border bg-card hover:shadow-md lg:col-span-2"
                >
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted">
                        <h3 className="flex items-center text-lg font-medium text-foreground">
                            <TicketIcon className="w-5 h-5 mr-2 text-primary" />
                            Recent Reservations
                        </h3>
                        <motion.div whileHover={{ x: 2 }}>
                            <Link href={route('admin.reservations.index')} className="text-sm font-medium text-primary hover:text-primary/90">
                            View All
                        </Link>
                        </motion.div>
                    </div>
                    <div className="divide-y divide-border">
                        {recentReservations.length > 0 ? (
                            recentReservations.map((reservation, index) => (
                                <motion.div
                                    key={reservation.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="transition-colors hover:bg-muted/40"
                                >
                                    <div className="px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className={`h-9 w-9 flex items-center justify-center rounded-full ${getStatusBadgeClass(reservation.status).replace('text-', 'bg-').replace('/20', '/10')}`}>
                                                    <UserIcon className={`h-4 w-4 ${getStatusBadgeClass(reservation.status)}`} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-foreground line-clamp-1">
                                                        {reservation.user?.name || reservation.guest_name || 'Anonymous User'}
                                                    </p>
                                                    <div className="flex items-center mt-1 space-x-2 text-xs text-muted-foreground">
                                                        <span>{reservation.reservation_code}</span>
                                                        <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                                                        <span>{formatDate(reservation.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-foreground line-clamp-1">{reservation.screening.film.title}</p>
                                                <div className="flex items-center justify-end mt-1 space-x-1 text-xs">
                                                    <ClockIcon className="w-3 h-3 text-muted-foreground" />
                                                    <span className="text-muted-foreground">{formatTime(reservation.screening.start_time)}</span>
                                                    <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${getStatusBadgeClass(reservation.status)}`}>
                                                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="px-6 py-8 text-center">
                                <p className="text-sm text-muted-foreground">No recent reservations found.</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="overflow-hidden transition-shadow border rounded-lg shadow-sm border-border bg-card hover:shadow-md"
                >
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted">
                        <h3 className="flex items-center text-lg font-medium text-foreground">
                            <CalendarIcon className="w-5 h-5 mr-2 text-primary" />
                            Upcoming Screenings
                        </h3>
                        <motion.div whileHover={{ x: 2 }}>
                            <Link href={route('admin.screenings.index')} className="text-sm font-medium text-primary hover:text-primary/90">
                            View All
                        </Link>
                        </motion.div>
                    </div>
                    <div className="px-6 py-4">
                        <div className="divide-y divide-border">
                            {upcomingScreenings.length > 0 ? (
                                upcomingScreenings.map((screening, index) => (
                                    <motion.div
                                        key={screening.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className="px-2 py-3 -mx-2 transition-colors rounded-md first:pt-0 last:pb-0 hover:bg-muted/10"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate text-foreground">{screening.film.title}</p>
                                                <div className="flex items-center mt-1 space-x-1">
                                                    <ClockIcon className="w-3 h-3 text-muted-foreground" />
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatTime(screening.start_time)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary whitespace-nowrap">
                                                    {screening.room}
                                                </span>
                                            </div>
                                    </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="py-8 text-center">
                                    <p className="text-sm text-muted-foreground">No upcoming screenings found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AdminLayout>
    );
}
