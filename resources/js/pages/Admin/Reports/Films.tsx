import AdminLayout from '@/layouts/AdminLayout';
import { CalendarIcon, ChartBarIcon, CreditCardIcon, FilmIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';

interface Film {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
    duration: number;
    director: string;
    genre: string;
    reservations_count: number;
}

interface Props {
    films: {
        data: Film[];
        links: any[];
        total: number;
        current_page: number;
        last_page: number;
    };
    period: string;
    filters: {
        search?: string;
    };
}

export default function Films({ films, period, filters }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        period: period,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('admin.reports.films'), {
            preserveState: true,
        });
    };

    const handlePeriodChange = (period: string) => {
        setData('period', period);
        get(route('admin.reports.films'), {
            preserveState: true,
        });
    };

    return (
        <AdminLayout title="Film Popularity Report" subtitle="Monitor which films are attracting most attendance">
            <Head title="Film Popularity Report" />

            {/* Report Navigation */}
            <div className="mb-6 border rounded-lg shadow-sm border-border bg-card">
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
            </div>

            {/* Header with actions */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <ChartBarIcon className="w-6 h-6 mr-2 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Film Popularity</h2>
                </div>
            </div>

            {/* Period filter */}
            <div className="mb-6 border rounded-lg shadow-sm border-border bg-card">
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="mb-2 text-base font-medium text-foreground">Time Period</h3>
                            <div className="flex space-x-2">
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
                        <div>
                            <form onSubmit={handleSearch} className="flex items-center w-full max-w-sm space-x-2">
                                <div className="relative flex-1">
                                    <MagnifyingGlassIcon className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search films..."
                                        value={data.search}
                                        onChange={(e) => setData('search', e.target.value)}
                                        className="w-full py-2 pr-4 border rounded-md outline-none focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground pl-9 focus:outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white transition rounded-md bg-primary hover:bg-primary/90 focus:ring-primary/30 focus:ring-2 focus:outline-none disabled:opacity-70"
                                >
                                    Search
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Films list */}
            <div className="overflow-hidden rounded-lg shadow">
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
                            {films.data.length > 0 ? (
                                films.data.map((film, index) => (
                                    <tr key={film.id} className="transition-colors hover:bg-muted/40">
                                        <td className="px-6 py-4 text-foreground whitespace-nowrap">
                                            <div className="flex items-center justify-center w-8 h-8 text-sm font-medium rounded-full bg-muted">
                                                {(films.current_page - 1) * 10 + index + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FilmIcon className="w-5 h-5 mr-2 text-primary" />
                                                <div>
                                                    <div className="text-sm font-medium text-foreground">{film.title}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {film.release_date && new Date(film.release_date).getFullYear()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">{film.director}</td>
                                        <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">{film.genre}</td>
                                        <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">{film.duration} min</td>
                                        <td className="px-6 py-4 text-sm font-medium text-foreground whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="mr-2">{film.reservations_count}</span>
                                                <div className="w-32 h-2 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full bg-primary"
                                                        style={{
                                                            width: `${Math.min(
                                                                (film.reservations_count / (films.data[0]?.reservations_count || 1)) * 100,
                                                                100,
                                                            )}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <Link
                                                    href={route('admin.films.show', { film: film.id })}
                                                    className="transition text-primary hover:text-primary/80"
                                                    title="View Details"
                                                >
                                                    <ChartBarIcon className="w-5 h-5" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <FilmIcon className="w-12 h-12 mb-4 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">
                                                {data.search
                                                    ? 'No films match your search query.'
                                                    : 'No film reservation data available for this period.'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {films.data.length > 0 && films.last_page > 1 && (
                <div className="flex items-center justify-between pt-6 mt-6 border-t">
                    <div className="text-sm text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{films.current_page}</span> of{' '}
                        <span className="font-medium text-foreground">{films.last_page}</span> pages
                    </div>
                    <div className="flex space-x-2">
                        {films.links.map((link, i) => {
                            if (link.label === '&laquo; Previous') {
                                return (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`border-border hover:bg-muted flex items-center rounded-md border px-3 py-1 text-sm ${
                                            !link.url ? 'pointer-events-none opacity-50' : ''
                                        }`}
                                    >
                                        Previous
                                    </Link>
                                );
                            } else if (link.label === 'Next &raquo;') {
                                return (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`border-border hover:bg-muted flex items-center rounded-md border px-3 py-1 text-sm ${
                                            !link.url ? 'pointer-events-none opacity-50' : ''
                                        }`}
                                    >
                                        Next
                                    </Link>
                                );
                            } else {
                                return (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`border-border flex h-8 w-8 items-center justify-center rounded-md border text-sm ${
                                            link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'
                                        } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            }
                        })}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
