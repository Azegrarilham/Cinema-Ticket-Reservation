import AdminLayout from '@/layouts/AdminLayout';
import {
    ArrowDownCircleIcon,
    ArrowUpCircleIcon,
    CalendarIcon,
    ChartBarIcon,
    ClockIcon,
    CreditCardIcon,
    FilmIcon,
    TicketIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import { Head, Link } from '@inertiajs/react';
import Chart from 'chart.js/auto';
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
                                    label: (context) => {
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
            return <ArrowUpCircleIcon className="text-success h-5 w-5" />;
        } else if (value < 0) {
            return <ArrowDownCircleIcon className="text-destructive h-5 w-5" />;
        }
        return null;
    };

    return (
        <AdminLayout title="Cinema Dashboard" subtitle="Overview of your cinema's performance">
            <Head title="Admin Dashboard" />

            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Films</p>
                                <div className="mt-1 flex items-center space-x-1">
                                    <h3 className="text-foreground text-2xl font-bold">{stats.films_count}</h3>
                                    {stats.recent_growth?.films !== undefined && (
                                        <div className="ml-2 flex items-center text-xs">
                                            {getGrowthIcon(stats.recent_growth.films)}
                                            <span className={stats.recent_growth.films > 0 ? 'text-success' : 'text-destructive'}>
                                                {Math.abs(stats.recent_growth.films)}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-muted-foreground mt-1 text-xs">Total films in catalog</p>
                            </div>
                            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                                <FilmIcon className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Screenings</p>
                                <div className="mt-1 flex items-center space-x-1">
                                    <h3 className="text-foreground text-2xl font-bold">{stats.screenings_count}</h3>
                                    {stats.recent_growth?.screenings !== undefined && (
                                        <div className="ml-2 flex items-center text-xs">
                                            {getGrowthIcon(stats.recent_growth.screenings)}
                                            <span className={stats.recent_growth.screenings > 0 ? 'text-success' : 'text-destructive'}>
                                                {Math.abs(stats.recent_growth.screenings)}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-muted-foreground mt-1 text-xs">Total scheduled screenings</p>
                            </div>
                            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                                <CalendarIcon className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Reservations</p>
                                <div className="mt-1 flex items-center space-x-1">
                                    <h3 className="text-foreground text-2xl font-bold">{stats.reservations_count}</h3>
                                    {stats.recent_growth?.reservations !== undefined && (
                                        <div className="ml-2 flex items-center text-xs">
                                            {getGrowthIcon(stats.recent_growth.reservations)}
                                            <span className={stats.recent_growth.reservations > 0 ? 'text-success' : 'text-destructive'}>
                                                {Math.abs(stats.recent_growth.reservations)}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-muted-foreground mt-1 text-xs">Total customer bookings</p>
                            </div>
                            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                                <TicketIcon className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Revenue</p>
                                <div className="mt-1 flex items-center space-x-1">
                                    <h3 className="text-foreground text-2xl font-bold">{formatCurrency(stats.revenue)}</h3>
                                    {stats.recent_growth?.revenue !== undefined && (
                                        <div className="ml-2 flex items-center text-xs">
                                            {getGrowthIcon(stats.recent_growth.revenue)}
                                            <span className={stats.recent_growth.revenue > 0 ? 'text-success' : 'text-destructive'}>
                                                {Math.abs(stats.recent_growth.revenue)}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-muted-foreground mt-1 text-xs">Total earnings</p>
                            </div>
                            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                                <CreditCardIcon className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts & Upcoming Screenings */}
            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Popular Films Chart */}
                <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
                    <div className="border-border bg-muted flex items-center justify-between border-b px-6 py-4">
                        <h3 className="text-foreground flex items-center text-lg font-medium">
                            <ChartBarIcon className="text-primary mr-2 h-5 w-5" />
                            Popular Films
                        </h3>
                        <Link href={route('admin.reports.films')} className="text-primary hover:text-primary/90 text-sm font-medium">
                            View Report
                        </Link>
                    </div>
                    <div className="p-6">
                        <div className="h-[240px] w-full">
                            <canvas ref={popularFilmsChartRef}></canvas>
                        </div>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
                    <div className="border-border bg-muted flex items-center justify-between border-b px-6 py-4">
                        <h3 className="text-foreground flex items-center text-lg font-medium">
                            <CreditCardIcon className="text-primary mr-2 h-5 w-5" />
                            Monthly Revenue
                        </h3>
                        <Link href={route('admin.reports.revenue')} className="text-primary hover:text-primary/90 text-sm font-medium">
                            View Report
                        </Link>
                    </div>
                    <div className="p-6">
                        <div className="h-[240px] w-full">
                            <canvas ref={revenueChartRef}></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Recent Reservations */}
                <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm lg:col-span-2">
                    <div className="border-border bg-muted flex items-center justify-between border-b px-6 py-4">
                        <h3 className="text-foreground flex items-center text-lg font-medium">
                            <TicketIcon className="text-primary mr-2 h-5 w-5" />
                            Recent Reservations
                        </h3>
                        <Link href={route('admin.reservations.index')} className="text-primary hover:text-primary/90 text-sm font-medium">
                            View All
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="divide-border min-w-full divide-y">
                            <thead className="bg-muted">
                                <tr>
                                    <th
                                        scope="col"
                                        className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
                                    >
                                        Code
                                    </th>
                                    <th
                                        scope="col"
                                        className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
                                    >
                                        Film
                                    </th>
                                    <th
                                        scope="col"
                                        className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
                                    >
                                        Customer
                                    </th>
                                    <th
                                        scope="col"
                                        className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
                                    >
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
                                    >
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-card divide-border divide-y">
                                {recentReservations.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center">
                                            <div className="flex flex-col items-center">
                                                <TicketIcon className="text-muted-foreground mb-2 h-10 w-10" />
                                                <p className="text-muted-foreground text-sm">No recent reservations available</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    recentReservations.slice(0, 5).map((reservation) => (
                                        <tr key={reservation.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="text-foreground px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                <Link
                                                    href={route('admin.reservations.show', { reservation: reservation.id })}
                                                    className="text-primary hover:text-primary/80"
                                                >
                                                    {reservation.reservation_code}
                                                </Link>
                                            </td>
                                            <td className="text-foreground px-6 py-4 text-sm whitespace-nowrap">
                                                {reservation.screening.film.title.length > 20
                                                    ? reservation.screening.film.title.substring(0, 20) + '...'
                                                    : reservation.screening.film.title}
                                            </td>
                                            <td className="text-foreground px-6 py-4 text-sm whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <UserIcon className="text-muted-foreground mr-2 h-4 w-4" />
                                                    {reservation.user?.name || reservation.guest_name || 'Anonymous'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                                                        reservation.status,
                                                    )}`}
                                                >
                                                    {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="text-foreground px-6 py-4 text-sm whitespace-nowrap">
                                                {formatDate(reservation.created_at)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Upcoming Screenings */}
                <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
                    <div className="border-border bg-muted flex items-center justify-between border-b px-6 py-4">
                        <h3 className="text-foreground flex items-center text-lg font-medium">
                            <CalendarIcon className="text-primary mr-2 h-5 w-5" />
                            Upcoming Screenings
                        </h3>
                        <Link href={route('admin.screenings.index')} className="text-primary hover:text-primary/90 text-sm font-medium">
                            View All
                        </Link>
                    </div>
                    <div className="px-6 py-4">
                        <div className="divide-border divide-y">
                            {upcomingScreenings.length === 0 ? (
                                <div className="flex flex-col items-center py-6 text-center">
                                    <CalendarIcon className="text-muted-foreground mb-2 h-10 w-10" />
                                    <p className="text-muted-foreground text-sm">No upcoming screenings scheduled</p>
                                </div>
                            ) : (
                                upcomingScreenings.slice(0, 5).map((screening) => (
                                    <div key={screening.id} className="py-3 first:pt-0 last:pb-0">
                                        <Link
                                            href={route('admin.screenings.show', { screening: screening.id })}
                                            className="hover:bg-muted/30 -mx-2 block rounded-md px-2 py-2 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="text-foreground text-sm font-medium">
                                                        {screening.film.title.length > 30
                                                            ? screening.film.title.substring(0, 30) + '...'
                                                            : screening.film.title}
                                                    </h4>
                                                    <p className="text-muted-foreground mt-1 text-xs">Room: {screening.room}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-muted-foreground flex items-center text-xs">
                                                        <CalendarIcon className="mr-1 h-3 w-3" />
                                                        {formatDate(screening.start_time)}
                                                    </div>
                                                    <div className="text-muted-foreground mt-1 flex items-center text-xs">
                                                        <ClockIcon className="mr-1 h-3 w-3" />
                                                        {formatTime(screening.start_time)}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
                <div className="border-border bg-muted border-b px-6 py-4">
                    <h3 className="text-foreground text-lg font-medium">Quick Actions</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                        <Link
                            href={route('admin.films.create')}
                            className="border-border hover:bg-muted flex flex-col items-center justify-center rounded-lg border p-4 text-center transition"
                        >
                            <div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                                <FilmIcon className="h-6 w-6" />
                            </div>
                            <h4 className="text-foreground mb-1 text-sm font-medium">Add New Film</h4>
                            <p className="text-muted-foreground text-xs">Create a film entry</p>
                        </Link>

                        <Link
                            href={route('admin.screenings.create')}
                            className="border-border hover:bg-muted flex flex-col items-center justify-center rounded-lg border p-4 text-center transition"
                        >
                            <div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                                <CalendarIcon className="h-6 w-6" />
                            </div>
                            <h4 className="text-foreground mb-1 text-sm font-medium">Schedule Screening</h4>
                            <p className="text-muted-foreground text-xs">Add a new showing</p>
                        </Link>

                        <Link
                            href={route('admin.reports.revenue')}
                            className="border-border hover:bg-muted flex flex-col items-center justify-center rounded-lg border p-4 text-center transition"
                        >
                            <div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                                <ChartBarIcon className="h-6 w-6" />
                            </div>
                            <h4 className="text-foreground mb-1 text-sm font-medium">View Reports</h4>
                            <p className="text-muted-foreground text-xs">Check performance</p>
                        </Link>

                        <Link
                            href={route('admin.reservations.index')}
                            className="border-border hover:bg-muted flex flex-col items-center justify-center rounded-lg border p-4 text-center transition"
                        >
                            <div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                                <TicketIcon className="h-6 w-6" />
                            </div>
                            <h4 className="text-foreground mb-1 text-sm font-medium">Manage Reservations</h4>
                            <p className="text-muted-foreground text-xs">Handle bookings</p>
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
