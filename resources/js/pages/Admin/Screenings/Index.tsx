import AdminLayout from '@/layouts/AdminLayout';
import { CalendarIcon, ClockIcon, EyeIcon, FilmIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Head, Link, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

interface Film {
    id: number;
    title: string;
}

interface Screening {
    id: number;
    film: {
        id: number;
        title: string;
        duration: number;
    };
    start_time: string;
    room: string;
    price: number;
    total_seats: number;
    is_active: boolean;
    available_seats_count?: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    screenings: {
        data: Screening[];
        links: PaginationLink[];
        total: number;
        current_page: number;
        last_page: number;
    };
    films: Film[];
    filters: {
        film_id?: string;
        date?: string;
    };
}

export default function Index({ screenings, films, filters }: Props) {
    const { data, setData, get, processing } = useForm({
        film_id: filters.film_id || '',
        date: filters.date || '',
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [screeningToDelete, setScreeningToDelete] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('admin.screenings.index'), {
            preserveState: true,
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleDelete = (id: number) => {
        setScreeningToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (screeningToDelete) {
            router.delete(route('admin.screenings.destroy', { screening: screeningToDelete }), {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setScreeningToDelete(null);
                },
            });
        }
    };

    const handleClearFilters = () => {
        setData({
            film_id: '',
            date: '',
        });
        get(route('admin.screenings.index'), {
            preserveState: true,
        });
    };

    return (
        <AdminLayout title="Screenings Management" subtitle="Manage your cinema's screenings schedule">
            <Head title="Screenings Management" />

            {/* Header with actions */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <CalendarIcon className="w-6 h-6 mr-2 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Screenings</h2>
                    <span className="px-2 py-1 ml-3 text-xs font-medium rounded-md bg-muted">{screenings.total} total</span>
                </div>
                <Link
                    href={route('admin.screenings.create')}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white transition rounded-md shadow-sm bg-primary hover:bg-primary/90 focus:ring-primary/30 focus:ring-2 focus:outline-none"
                >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Add New Screening
                </Link>
            </div>

            {/* Search and filters */}
            <div className="mb-6 border rounded-lg shadow-sm border-border bg-card">
                <div className="p-4">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <label htmlFor="film_id" className="text-foreground mb-1.5 block text-sm font-medium">
                                    Filter by Film
                                </label>
                                <select
                                    id="film_id"
                                    value={data.film_id}
                                    onChange={(e) => setData('film_id', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground"
                                >
                                    <option value="">All Films</option>
                                    {films.map((film) => (
                                        <option key={film.id} value={film.id}>
                                            {film.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="date" className="text-foreground mb-1.5 block text-sm font-medium">
                                    Filter by Date
                                </label>
                                <input
                                    id="date"
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground"
                                />
                            </div>

                            <div className="flex items-end space-x-3">
                                <button
                                    type="submit"
                                    className="flex items-center px-4 py-2 text-sm font-medium text-white transition rounded-md bg-primary hover:bg-primary/90 focus:ring-primary/30 focus:ring-2 focus:outline-none disabled:opacity-70"
                                    disabled={processing}
                                >
                                    <MagnifyingGlassIcon className="mr-1.5 h-4 w-4" />
                                    Filter
                                </button>
                                {(data.film_id || data.date) && (
                                    <button
                                        type="button"
                                        onClick={handleClearFilters}
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium transition border rounded-md border-border text-foreground hover:bg-muted"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Screenings list table */}
            <div className="overflow-hidden rounded-lg shadow">
                <div className="relative overflow-x-auto border border-border bg-card">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Film
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Date & Time
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Room
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Price
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Seats
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                            {screenings.data.length > 0 ? (
                                screenings.data.map((screening) => (
                                    <tr key={screening.id} className="transition-colors hover:bg-muted/40">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FilmIcon className="w-5 h-5 mr-2 text-primary" />
                                                <div>
                                                    <div className="text-sm font-medium text-foreground">{screening.film.title}</div>
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                        <ClockIcon className="w-3 h-3 mr-1" />
                                                        {screening.film.duration} min
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="font-medium">{formatDate(screening.start_time)}</div>
                                                <div className="text-muted-foreground">{formatTime(screening.start_time)}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">{screening.room}</td>
                                        <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                                            ${typeof screening.price === 'number' ? screening.price.toFixed(2) : Number(screening.price).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                                            {screening.available_seats_count !== undefined ? (
                                                <div className="flex items-center space-x-1 font-medium text-foreground">
                                                    <span>{screening.available_seats_count}</span>
                                                    <span className="text-muted-foreground">/</span>
                                                    <span>{screening.total_seats}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <span className="font-medium text-amber-500">Missing seats</span>
                                                    <Link
                                                        href={route('admin.screenings.show', { screening: screening.id })}
                                                        className="ml-2 text-xs text-primary hover:underline"
                                                    >
                                                        Fix
                                                    </Link>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    screening.is_active ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                {screening.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <Link
                                                    href={route('admin.screenings.show', { screening: screening.id })}
                                                    className="transition text-primary hover:text-primary/80"
                                                    title="View"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                </Link>
                                                <Link
                                                    href={route('admin.screenings.edit', { screening: screening.id })}
                                                    className="transition text-warning hover:text-warning/80"
                                                    title="Edit"
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(screening.id)}
                                                    className="transition text-destructive hover:text-destructive/80"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <CalendarIcon className="w-12 h-12 mb-4 text-muted-foreground" />
                                            <p className="mb-4 text-sm text-muted-foreground">
                                                {data.film_id || data.date
                                                    ? 'No screenings match your filter criteria.'
                                                    : 'No screenings have been created yet.'}
                                            </p>
                                            {data.film_id || data.date ? (
                                                <button
                                                    onClick={handleClearFilters}
                                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition rounded-md bg-primary hover:bg-primary/90 focus:ring-primary/30 focus:ring-2 focus:outline-none"
                                                >
                                                    Clear Filters
                                                </button>
                                            ) : (
                                                <Link
                                                    href={route('admin.screenings.create')}
                                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition rounded-md bg-primary hover:bg-primary/90 focus:ring-primary/30 focus:ring-2 focus:outline-none"
                                                >
                                                    Create First Screening
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {screenings.data.length > 0 && screenings.last_page > 1 && (
                <div className="flex items-center justify-between pt-6 mt-6 border-t">
                    <div className="text-sm text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{screenings.current_page}</span> of{' '}
                        <span className="font-medium text-foreground">{screenings.last_page}</span> pages
                    </div>
                    <div className="flex space-x-2">
                        {screenings.links.map((link, i) => {
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

            {/* Delete confirmation modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-card">
                        <div className="flex items-center mb-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10 text-destructive">
                                <TrashIcon className="w-5 h-5" />
                            </div>
                            <h3 className="ml-3 text-lg font-medium text-foreground">Delete Screening</h3>
                        </div>

                        <p className="mb-6 text-muted-foreground">
                            Are you sure you want to delete this screening? This action cannot be undone and will remove all seats associated with
                            this screening.
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium border rounded-md border-border text-foreground hover:bg-muted focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-medium rounded-md bg-destructive hover:bg-destructive/90 text-destructive-foreground focus:outline-none"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
