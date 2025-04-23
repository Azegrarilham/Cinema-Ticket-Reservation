import { Pagination } from '@/components/ui/pagination';
import DeletePopup from '@/components/ui/DeletePopup';
import MotionLink from '@/components/ui/motion-link';
import AdminLayout from '@/layouts/AdminLayout';
import { CalendarIcon, CreditCardIcon, EyeIcon, FilmIcon, MagnifyingGlassIcon, TicketIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
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

export default function Index({ reservations, films, screenings, filters, statuses }: Props) {
    const { data, setData, get, processing } = useForm({
        film_id: filters.film_id || '',
        screening_id: filters.screening_id || '',
        status: filters.status || '',
        date: filters.date || '',
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [reservationToDelete, setReservationToDelete] = useState<number | null>(null);
    const [deletingReservation, setDeletingReservation] = useState<Reservation | null>(null);
    const [isProcessingDelete, setIsProcessingDelete] = useState(false);

    // Use React's useEffect to trigger filtering when form data changes
    React.useEffect(() => {
        // Don't run on initial mount
        const currentFilters = {
            film_id: data.film_id,
            screening_id: data.screening_id,
            status: data.status,
            date: data.date
        };

        if (JSON.stringify(filters) !== JSON.stringify(currentFilters)) {
            // Use debounce to avoid rapid-fire requests when multiple filters change
            const timeoutId = setTimeout(() => {
                // Double check that the component is still mounted before making the request
                get(route('admin.reservations.index'), {
                    preserveState: true,
                    replace: true,
                });
            }, 300);

            return () => clearTimeout(timeoutId);
        }
    }, [data.film_id, data.screening_id, data.status, data.date]);

    // Handle film filter change with debounce handling
    const handleFilmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;

        // First set the film ID
        setData('film_id', value);

        // Then clear the screening ID - this needs to happen after setting film_id
        // but before the filtering happens
        if (data.screening_id) {
            setData('screening_id', '');
        }
    };

    // Handle screening filter change
    const handleScreeningChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData('screening_id', e.target.value);
    };

    // Handle status filter change
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData('status', e.target.value);
    };

    // Handle date filter change
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('date', e.target.value);
    };

    // Keep the form submission handler for compatibility
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('admin.reservations.index'), {
            preserveState: true,
            replace: true,
        });
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

    const handleDelete = (reservation: Reservation) => {
        setDeletingReservation(reservation);
        setReservationToDelete(reservation.id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (reservationToDelete) {
            setIsProcessingDelete(true);
            router.delete(route('admin.reservations.destroy', { reservation: reservationToDelete }), {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setReservationToDelete(null);
                    setDeletingReservation(null);
                    setIsProcessingDelete(false);
                },
                onError: () => {
                    setIsProcessingDelete(false);
                },
            });
        }
    };

    const handleClearFilters = () => {
        // Clear all filters in a consistent way
        setData({
            film_id: '',
            screening_id: '',
            status: '',
            date: '',
        });
        get(route('admin.reservations.index'), {
            preserveState: true,
            replace: true,
        });
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return 'bg-success/20 text-success';
            case 'pending':
            case 'waiting':
                return 'bg-warning/20 text-warning';
            case 'cancelled':
                return 'bg-destructive/20 text-destructive';
            case 'completed':
                return 'bg-primary/20 text-primary';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    const getPaymentStatusBadgeClass = (payment: Payment | null) => {
        if (!payment) return 'bg-muted text-muted-foreground';

        switch (payment.status.toLowerCase()) {
            case 'paid':
            case 'completed':
                return 'bg-success/20 text-success';
            case 'pending':
            case 'waiting':
                return 'bg-warning/20 text-warning';
            case 'failed':
            case 'declined':
                return 'bg-destructive/20 text-destructive';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <AdminLayout title="Reservations Management" subtitle="Manage your cinema's customer bookings">
            <Head title="Reservations Management" />

            {/* Actions header */}
            <motion.div
                className="flex items-center justify-between mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-center">
                    <motion.div
                        whileHover={{ rotate: 10 }}
                        className="flex items-center justify-center w-10 h-10 mr-2 rounded-lg bg-primary/10"
                    >
                        <TicketIcon className="w-6 h-6 text-primary" />
                    </motion.div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Customer Reservations</h2>
                        <span className="px-2 py-1 ml-1 text-xs font-medium rounded-md bg-muted">{reservations.total} total</span>
                    </div>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div
                className="mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
            >
                <form onSubmit={handleSearch} className="p-4 space-y-4 border rounded-lg shadow-sm bg-card border-border">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div>
                            <label htmlFor="film_id" className="block mb-1 text-sm font-medium text-foreground">
                                Film
                            </label>
                            <select
                                id="film_id"
                                value={data.film_id}
                                onChange={handleFilmChange}
                                className="block w-full px-3 py-2 border rounded-md shadow-sm focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input"
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
                            <label htmlFor="screening_id" className="block mb-1 text-sm font-medium text-foreground">
                                Screening
                            </label>
                            <select
                                id="screening_id"
                                value={data.screening_id}
                                onChange={handleScreeningChange}
                                className="block w-full px-3 py-2 border rounded-md shadow-sm focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input"
                                disabled={!data.film_id}
                            >
                                <option value="">All Screenings</option>
                                {screenings
                                    .filter(s => !data.film_id || (s.id && data.film_id))
                                    .map((screening) => (
                                        <option key={screening.id} value={screening.id}>
                                            {formatDate(screening.start_time)} {formatTime(screening.start_time)}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="status" className="block mb-1 text-sm font-medium text-foreground">
                                Status
                            </label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={handleStatusChange}
                                className="block w-full px-3 py-2 border rounded-md shadow-sm focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input"
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
                            <label htmlFor="date" className="block mb-1 text-sm font-medium text-foreground">
                                Reservation Date
                            </label>
                            <input
                                id="date"
                                type="date"
                                value={data.date}
                                onChange={handleDateChange}
                                className="block w-full px-3 py-2 border rounded-md shadow-sm focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input"
                            />
                        </div>
                    </div>

                    {(data.film_id || data.screening_id || data.status || data.date) && (
                        <div className="flex justify-end">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={handleClearFilters}
                                className="px-4 py-2 text-sm font-medium transition border rounded-md border-border hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                                Clear Filters
                            </motion.button>
                        </div>
                    )}
                </form>
            </motion.div>

            {/* Reservations Table */}
            <motion.div
                className="overflow-hidden transition-shadow rounded-lg shadow-md hover:shadow-lg"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="relative overflow-x-auto border border-border bg-card">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Customer
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Film
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Screening
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Seats
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Payment
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
                            {reservations.data.length > 0 ? (
                                reservations.data.map((reservation, index) => (
                                    <motion.tr
                                        key={reservation.id}
                                        className="transition-colors hover:bg-muted/40"
                                        variants={itemVariants}
                                        custom={index}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${reservation.user ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                                    }`}>
                                                    <UserIcon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-foreground">
                                                        {reservation.user?.name || reservation.guest_name || 'Anonymous'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {reservation.user?.email || reservation.guest_email || 'No email'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FilmIcon className="w-4 h-4 mr-2 text-primary" />
                                                <span className="text-sm text-foreground">{reservation.screening.film.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-foreground">{formatDate(reservation.screening.start_time)}</div>
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <CalendarIcon className="w-3 h-3 mr-1" />
                                                {formatTime(reservation.screening.start_time)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                {reservation.seats_count} {reservation.seats_count === 1 ? 'seat' : 'seats'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-foreground">
                                                {formatCurrency(reservation.total_price)}
                                            </div>
                                            {reservation.payment && (
                                                <div className="flex items-center mt-1">
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${getPaymentStatusBadgeClass(reservation.payment)}`}>
                                                        {reservation.payment.status}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(reservation.status)}`}>
                                                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                            <div className="flex space-x-3">
                                                <MotionLink
                                                    href={route('admin.reservations.show', { reservation: reservation.id })}
                                                    title="View Details"
                                                    icon
                                                    variant="primary"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                </MotionLink>
                                                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                                    <button
                                                        onClick={() => handleDelete(reservation)}
                                                        className="transition text-destructive hover:text-destructive/80"
                                                        title="Cancel Reservation"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </motion.div>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <TicketIcon className="w-12 h-12 mb-3 text-muted-foreground" />
                                            <h3 className="mb-1 text-lg font-medium text-foreground">No reservations found</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {data.film_id || data.screening_id || data.status || data.date
                                                    ? 'Try changing your filter criteria'
                                                    : 'No reservations have been made yet'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Pagination */}
            {reservations.data.length > 0 && (
                <motion.div
                    className="flex items-center justify-between mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <div className="flex items-center text-sm text-muted-foreground">
                        Showing <span className="mx-1 font-medium">{(reservations.current_page - 1) * 15 + 1}</span>
                        to <span className="mx-1 font-medium">{Math.min(reservations.current_page * 15, reservations.total)}</span>
                        of <span className="mx-1 font-medium">{reservations.total}</span> reservations
                    </div>
                    <Pagination
                        links={reservations.links}
                        currentPage={reservations.current_page}
                        totalPages={reservations.last_page}
                    />
                </motion.div>
            )}

            {/* Delete Confirmation Modal */}
            <DeletePopup
                isOpen={isDeleteModalOpen && !!deletingReservation}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={confirmDelete}
                title="Cancel Reservation"
                itemName={deletingReservation?.screening.film.title}
                description={deletingReservation ?
                    `Are you sure you want to cancel this reservation for {itemName} on ${formatDate(deletingReservation.screening.start_time)}? This action cannot be undone and all seats will be released.` :
                    "Are you sure you want to cancel this reservation? This action cannot be undone."
                }
                processing={isProcessingDelete}
            />
        </AdminLayout>
    );
}
