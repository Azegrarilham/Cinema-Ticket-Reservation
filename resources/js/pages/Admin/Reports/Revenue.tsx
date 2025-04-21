import AdminLayout from '@/layouts/AdminLayout';
import { CalendarIcon, ChartBarIcon, CreditCardIcon, FilmIcon } from '@heroicons/react/24/outline';
import { Head, Link, useForm } from '@inertiajs/react';
import Chart from 'chart.js/auto';
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

export default function Revenue({ dailyRevenue, filmRevenue, totalRevenue, films, period, filters }: Props) {
    const { data, setData, get } = useForm({
        film_id: filters.film_id || '',
        period: period,
    });

    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

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
        get(route('admin.reports.revenue'), {
            preserveState: true,
        });
    };

    const handleFilmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData('film_id', e.target.value);
        get(route('admin.reports.revenue'), {
            preserveState: true,
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <AdminLayout title="Revenue Report" subtitle="Track your cinema's financial performance">
            <Head title="Revenue Report" />

            {/* Report Navigation */}
            <div className="border-border bg-card mb-6 rounded-lg border shadow-sm">
                <div className="flex overflow-x-auto">
                    <Link
                        href={route('admin.reports.films')}
                        className="text-muted-foreground hover:text-foreground flex items-center border-b-2 border-transparent px-6 py-3 text-sm font-medium"
                    >
                        <FilmIcon className="mr-2 h-5 w-5" />
                        Film Popularity
                    </Link>
                    <Link
                        href={route('admin.reports.revenue')}
                        className="border-primary text-primary flex items-center border-b-2 px-6 py-3 text-sm font-medium"
                    >
                        <CreditCardIcon className="mr-2 h-5 w-5" />
                        Revenue
                    </Link>
                    <Link
                        href={route('admin.reports.screenings')}
                        className="text-muted-foreground hover:text-foreground flex items-center border-b-2 border-transparent px-6 py-3 text-sm font-medium"
                    >
                        <CalendarIcon className="mr-2 h-5 w-5" />
                        Screening Occupancy
                    </Link>
                </div>
            </div>

            {/* Header with actions */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                    <CreditCardIcon className="text-primary mr-2 h-6 w-6" />
                    <h2 className="text-foreground text-lg font-semibold">Revenue</h2>
                </div>
            </div>

            {/* Period & Film Filter */}
            <div className="border-border bg-card mb-6 rounded-lg border shadow-sm">
                <div className="p-4">
                    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                        <div>
                            <h3 className="text-foreground mb-2 text-base font-medium">Time Period</h3>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handlePeriodChange('week')}
                                    className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                                        data.period === 'week' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                >
                                    Last Week
                                </button>
                                <button
                                    onClick={() => handlePeriodChange('month')}
                                    className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                                        data.period === 'month' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                >
                                    Last Month
                                </button>
                                <button
                                    onClick={() => handlePeriodChange('quarter')}
                                    className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                                        data.period === 'quarter' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                >
                                    Last Quarter
                                </button>
                                <button
                                    onClick={() => handlePeriodChange('year')}
                                    className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                                        data.period === 'year' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                >
                                    Last Year
                                </button>
                                <button
                                    onClick={() => handlePeriodChange('all')}
                                    className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                                        data.period === 'all' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                >
                                    All Time
                                </button>
                            </div>
                        </div>
                        <div className="w-full md:w-64">
                            <label htmlFor="film_id" className="text-foreground mb-1.5 block text-sm font-medium">
                                Filter by Film
                            </label>
                            <select
                                id="film_id"
                                value={data.film_id}
                                onChange={handleFilmChange}
                                className="focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2"
                            >
                                <option value="">All Films</option>
                                {films.map((film) => (
                                    <option key={film.id} value={film.id}>
                                        {film.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Figures */}
            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="border-border bg-card overflow-hidden rounded-lg border p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-muted-foreground mb-1 text-sm font-medium">Total Revenue</p>
                            <h4 className="text-foreground text-2xl font-bold">{formatCurrency(totalRevenue)}</h4>
                        </div>
                        <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                            <CreditCardIcon className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                <div className="border-border bg-card overflow-hidden rounded-lg border p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-muted-foreground mb-1 text-sm font-medium">Total Transactions</p>
                            <h4 className="text-foreground text-2xl font-bold">{filmRevenue.reduce((acc, item) => acc + item.count, 0)}</h4>
                        </div>
                        <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="border-border bg-card overflow-hidden rounded-lg border p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-muted-foreground mb-1 text-sm font-medium">Avg. Transaction</p>
                            <h4 className="text-foreground text-2xl font-bold">
                                {formatCurrency(totalRevenue / (filmRevenue.reduce((acc, item) => acc + item.count, 0) || 1))}
                            </h4>
                        </div>
                        <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                            <ChartBarIcon className="h-6 w-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="border-border bg-card mb-6 h-80 overflow-hidden rounded-lg border shadow-sm">
                <div className="border-border bg-muted border-b px-6 py-4">
                    <h3 className="text-foreground text-lg font-medium">Daily Revenue</h3>
                </div>
                <div className="h-[calc(100%-4rem)] p-6">
                    <canvas ref={chartRef}></canvas>
                </div>
            </div>

            {/* Revenue by Film */}
            <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
                <div className="border-border bg-muted border-b px-6 py-4">
                    <h3 className="text-foreground text-lg font-medium">Revenue by Film</h3>
                </div>
                <div className="px-6 py-2">
                    <div className="overflow-x-auto">
                        <table className="divide-border min-w-full divide-y">
                            <thead className="bg-transparent">
                                <tr>
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
                                        Transactions
                                    </th>
                                    <th
                                        scope="col"
                                        className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
                                    >
                                        Revenue
                                    </th>
                                    <th
                                        scope="col"
                                        className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
                                    >
                                        % of Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-border divide-y">
                                {filmRevenue.length > 0 ? (
                                    filmRevenue.map((item) => (
                                        <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FilmIcon className="text-primary mr-2 h-5 w-5" />
                                                    <div className="text-foreground text-sm font-medium">{item.title}</div>
                                                </div>
                                            </td>
                                            <td className="text-foreground px-6 py-4 text-sm whitespace-nowrap">{item.count}</td>
                                            <td className="text-foreground px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                {formatCurrency(item.revenue)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className="text-foreground mr-2 text-sm">
                                                        {((item.revenue / totalRevenue) * 100).toFixed(1)}%
                                                    </span>
                                                    <div className="bg-muted h-2 w-32 overflow-hidden rounded-full">
                                                        <div
                                                            className="bg-primary h-full"
                                                            style={{
                                                                width: `${(item.revenue / totalRevenue) * 100}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <CreditCardIcon className="text-muted-foreground mb-4 h-12 w-12" />
                                                <p className="text-muted-foreground text-sm">No revenue data available for this period.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
