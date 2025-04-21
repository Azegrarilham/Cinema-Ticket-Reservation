import AdminLayout from '@/layouts/AdminLayout';
import { CalendarIcon, CreditCardIcon, EyeIcon, FilmIcon, MagnifyingGlassIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';
import { Head, Link, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

interface Film {
    id: number;
    title: string;
}

interface Screening {
    id: number;
    start_time: string;
}

interface Payment {
    id: number;
    amount: number;
    payment_method: string;
    status: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Reservation {
    id: number;
    screening: {
        id: number;
        film: {
            id: number;
            title: string;
        };
        start_time: string;
    };
    user: User | null;
    payment: Payment | null;
    status: string;
    total_price: number;
    seats_count: number;
    created_at: string;
    guest_name?: string;
    guest_email?: string;
}

interface Props {
    reservations: {
        data: Reservation[];
        links: any[];
        total: number;
        current_page: number;
        last_page: number;
    };
    films: Film[];
    screenings: Screening[];
    filters: {
        film_id?: string;
        screening_id?: string;
        status?: string;
        date?: string;
    };
    statuses: string[];
}

export default function Index({ reservations, films, screenings, filters, statuses }: Props) {
    const { data, setData, get, processing } = useForm({
        film_id: filters.film_id || '',
        screening_id: filters.screening_id || '',
        status: filters.status || '',
        date: filters.date || '',
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [reservationToDelete, setReservationToDelete] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('admin.reservations.index'), {
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

    const formatCurrency = (amount: number | null | undefined) => {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return '$0.00';
        }

        // Convert to number if it's a string and ensure it's a valid number
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

        if (isNaN(numericAmount)) {
            return '$0.00';
        }

        // Format with 2 decimal places
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numericAmount);
    };

    const handleDelete = (id: number) => {
        setReservationToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (reservationToDelete) {
            router.delete(route('admin.reservations.destroy', { reservation: reservationToDelete }), {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setReservationToDelete(null);
                },
            });
        }
    };

    const handleClearFilters = () => {
        setData({
            film_id: '',
            screening_id: '',
            status: '',
            date: '',
        });
        get(route('admin.reservations.index'), {
            preserveState: true,
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

    return (
        <AdminLayout title="Reservations Management" subtitle="Manage customer reservations">
            <Head title="Reservations Management" />

            {/* Header with actions */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                    <CreditCardIcon className="text-primary mr-2 h-6 w-6" />
                    <h2 className="text-foreground text-lg font-semibold">Reservations</h2>
                    <span className="bg-muted ml-3 rounded-md px-2 py-1 text-xs font-medium">{reservations.total} total</span>
                </div>
            </div>

            {/* Search and filters */}
            <div className="border-border bg-card mb-6 rounded-lg border shadow-sm">
                <div className="p-4">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <label htmlFor="film_id" className="text-foreground mb-1.5 block text-sm font-medium">
                                    Filter by Film
                                </label>
                                <select
                                    id="film_id"
                                    value={data.film_id}
                                    onChange={(e) => {
                                        setData('film_id', e.target.value);
                                        setData('screening_id', '');
                                    }}
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

                            <div>
                                <label htmlFor="screening_id" className="text-foreground mb-1.5 block text-sm font-medium">
                                    Filter by Screening
                                </label>
                                <select
                                    id="screening_id"
                                    value={data.screening_id}
                                    onChange={(e) => setData('screening_id', e.target.value)}
                                    className="focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2"
                                    disabled={!data.film_id || screenings.length === 0}
                                >
                                    <option value="">All Screenings</option>
                                    {screenings.map((screening) => (
                                        <option key={screening.id} value={screening.id}>
                                            {formatDate(screening.start_time)} {formatTime(screening.start_time)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="status" className="text-foreground mb-1.5 block text-sm font-medium">
                                    Filter by Status
                                </label>
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2"
                                >
                                    <option value="">All Statuses</option>
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
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
                                    className="focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                type="submit"
                                className="bg-primary hover:bg-primary/90 focus:ring-primary/30 flex items-center rounded-md px-4 py-2 text-sm font-medium text-white transition focus:ring-2 focus:outline-none disabled:opacity-70"
                                disabled={processing}
                            >
                                <MagnifyingGlassIcon className="mr-1.5 h-4 w-4" />
                                Filter
                            </button>
                            {(data.film_id || data.screening_id || data.status || data.date) && (
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="border-border text-foreground hover:bg-muted inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Reservations list table */}
            <div className="overflow-hidden rounded-lg shadow">
                <div className="border-border bg-card relative overflow-x-auto border">
                    <table className="divide-border min-w-full divide-y">
                        <thead className="bg-muted">
                            <tr>
                                <th scope="col" className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                                    ID
                                </th>
                                <th scope="col" className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                                    Film / Screening
                                </th>
                                <th scope="col" className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                                    Customer
                                </th>
                                <th scope="col" className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                                    Date Created
                                </th>
                                <th scope="col" className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                                    Seats
                                </th>
                                <th scope="col" className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                                    Total
                                </th>
                                <th scope="col" className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                                    Status
                                </th>
                                <th scope="col" className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-border bg-card divide-y">
                            {reservations.data.length > 0 ? (
                                reservations.data.map((reservation) => (
                                    <tr key={reservation.id} className="hover:bg-muted/40 transition-colors">
                                        <td className="text-foreground px-6 py-4 text-sm font-medium whitespace-nowrap">#{reservation.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FilmIcon className="text-primary mr-2 h-5 w-5" />
                                                <div>
                                                    <div className="text-foreground text-sm font-medium">{reservation.screening.film.title}</div>
                                                    <div className="text-muted-foreground flex items-center text-xs">
                                                        <CalendarIcon className="mr-1 h-3 w-3" />
                                                        {formatDate(reservation.screening.start_time)} {formatTime(reservation.screening.start_time)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <UserIcon className="text-muted-foreground mr-2 h-5 w-5" />
                                                <div>
                                                    <div className="text-foreground text-sm font-medium">
                                                        {reservation.user ? reservation.user.name : reservation.guest_name || 'Guest'}
                                                    </div>
                                                    <div className="text-muted-foreground text-xs">
                                                        {reservation.user ? reservation.user.email : reservation.guest_email || 'No email'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-foreground px-6 py-4 text-sm whitespace-nowrap">{formatDate(reservation.created_at)}</td>
                                        <td className="text-foreground px-6 py-4 text-center text-sm whitespace-nowrap">{reservation.seats_count}</td>
                                        <td className="text-foreground px-6 py-4 text-sm font-medium whitespace-nowrap">
                                            {formatCurrency(reservation.total_price)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                                                    reservation.status,
                                                )}`}
                                            >
                                                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <Link
                                                    href={route('admin.reservations.show', { reservation: reservation.id })}
                                                    className="text-primary hover:text-primary/80 transition"
                                                    title="View"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(reservation.id)}
                                                    className="text-destructive hover:text-destructive/80 transition"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <CreditCardIcon className="text-muted-foreground mb-4 h-12 w-12" />
                                            <p className="text-muted-foreground mb-4 text-sm">
                                                {data.film_id || data.screening_id || data.status || data.date
                                                    ? 'No reservations match your filter criteria.'
                                                    : 'No reservations have been made yet.'}
                                            </p>
                                            {(data.film_id || data.screening_id || data.status || data.date) && (
                                                <button
                                                    onClick={handleClearFilters}
                                                    className="bg-primary hover:bg-primary/90 focus:ring-primary/30 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white transition focus:ring-2 focus:outline-none"
                                                >
                                                    Clear Filters
                                                </button>
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
            {reservations.data.length > 0 && reservations.last_page > 1 && (
                <div className="mt-6 flex items-center justify-between border-t pt-6">
                    <div className="text-muted-foreground text-sm">
                        Showing <span className="text-foreground font-medium">{reservations.current_page}</span> of{' '}
                        <span className="text-foreground font-medium">{reservations.last_page}</span> pages
                    </div>
                    <div className="flex space-x-2">
                        {reservations.links.map((link, i) => {
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-card w-full max-w-md rounded-lg p-6 shadow-lg">
                        <div className="mb-4 flex items-center">
                            <div className="bg-destructive/10 text-destructive flex h-10 w-10 items-center justify-center rounded-full">
                                <TrashIcon className="h-5 w-5" />
                            </div>
                            <h3 className="text-foreground ml-3 text-lg font-medium">Delete Reservation</h3>
                        </div>

                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to delete this reservation? This action cannot be undone and will release all reserved seats.
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="border-border text-foreground hover:bg-muted rounded-md border px-4 py-2 text-sm font-medium focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md px-4 py-2 text-sm font-medium focus:outline-none"
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
