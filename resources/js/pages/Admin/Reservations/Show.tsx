import AdminLayout from '@/layouts/AdminLayout';
import { ArrowLeftIcon, CalendarIcon, CreditCardIcon, FilmIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Seat {
    id: number;
    row: string;
    number: number;
    status: string;
}

interface ReservationSeat {
    id: number;
    seat: Seat;
}

interface Payment {
    id: number;
    amount: number;
    payment_method: string;
    status: string;
    created_at: string;
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
            duration: number;
        };
        start_time: string;
        room: string;
        price: number;
    };
    user: User | null;
    payment: Payment | null;
    status: string;
    confirmation_code: string;
    reservationSeats: ReservationSeat[];
    total_price: number;
    created_at: string;
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
}

interface Props {
    reservation: Reservation;
}

export default function Show({ reservation }: Props) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState(reservation.status);

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
        // Make sure we have a valid number
        if (amount === null || amount === undefined || isNaN(amount)) {
            return '$0.00';
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    // Calculate a safe total price value that's always a valid number
    const calculateTotalPrice = (): number => {
        // First try the total_price property if it's a valid number
        if (typeof reservation.total_price === 'number' && !isNaN(reservation.total_price) && reservation.total_price > 0) {
            return reservation.total_price;
        }

        // Next try to calculate from reservation seats
        if (reservation.reservationSeats && reservation.reservationSeats.length > 0) {
            const seatCount = reservation.reservationSeats.length;

            // Make sure screening price is a valid number
            const screeningPrice = typeof reservation.screening.price === 'number'
                ? reservation.screening.price
                : parseFloat(String(reservation.screening.price));

            if (!isNaN(screeningPrice) && screeningPrice > 0) {
                return seatCount * screeningPrice;
            }
        }

        // If payment exists, use its amount
        if (reservation.payment && typeof reservation.payment.amount === 'number' && !isNaN(reservation.payment.amount) && reservation.payment.amount > 0) {
            return reservation.payment.amount;
        }

        // Fallback to zero if no valid price could be determined
        return 0;
    };

    const handleDelete = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route('admin.reservations.destroy', { reservation: reservation.id }), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
            },
        });
    };

    const handleStatusChange = () => {
        setIsStatusModalOpen(true);
    };

    const confirmStatusChange = () => {
        router.put(
            route('admin.reservations.update-status', { reservation: reservation.id }),
            {
                status: newStatus,
            },
            {
                onSuccess: () => {
                    setIsStatusModalOpen(false);
                },
            },
        );
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
        <AdminLayout title="Reservation Details" subtitle={`Viewing details for reservation #${reservation.id}`}>
            <Head title={`Reservation #${reservation.id}`} />

            {/* Header with actions */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                    <Link
                        href={route('admin.reservations.index')}
                        className="text-muted-foreground hover:text-foreground mr-4 flex items-center transition"
                    >
                        <ArrowLeftIcon className="mr-1 h-4 w-4" />
                        Back to Reservations
                    </Link>
                    <CreditCardIcon className="text-primary mr-2 h-6 w-6" />
                    <h2 className="text-foreground text-lg font-semibold">Reservation #{reservation.id}</h2>
                    <span className={`ml-3 inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(reservation.status)}`}>
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </span>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={handleStatusChange}
                        className="border-border text-foreground hover:bg-muted inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition"
                    >
                        Change Status
                    </button>
                    <button
                        onClick={handleDelete}
                        className="border-destructive text-destructive hover:bg-destructive/10 inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition"
                        disabled={reservation.status === 'confirmed'}
                    >
                        <TrashIcon className="mr-1.5 h-4 w-4" />
                        Delete
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Reservation details */}
                <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm md:col-span-2">
                    <div className="border-border bg-muted border-b px-6 py-4">
                        <h3 className="text-foreground text-lg font-medium">Reservation Details</h3>
                    </div>
                    <div className="divide-border divide-y">
                        {/* Film & Screening */}
                        <div className="px-6 py-4">
                            <div className="flex items-start">
                                <FilmIcon className="text-primary mt-1 mr-3 h-5 w-5" />
                                <div>
                                    <div className="text-muted-foreground mb-1 text-xs font-medium uppercase">Film & Screening</div>
                                    <div className="text-foreground mb-1 text-base font-semibold">{reservation.screening.film.title}</div>
                                    <div className="text-muted-foreground mb-1 text-sm">{reservation.screening.room}</div>
                                    <div className="text-muted-foreground text-sm">
                                        {formatDate(reservation.screening.start_time)} at {formatTime(reservation.screening.start_time)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer */}
                        <div className="px-6 py-4">
                            <div className="flex items-start">
                                <UserIcon className="text-primary mt-1 mr-3 h-5 w-5" />
                                <div>
                                    <div className="text-muted-foreground mb-1 text-xs font-medium uppercase">Customer</div>
                                    {reservation.user ? (
                                        <>
                                            <div className="text-foreground mb-1 text-base font-semibold">{reservation.user.name}</div>
                                            <div className="text-muted-foreground text-sm">{reservation.user.email}</div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-foreground mb-1 text-base font-semibold">
                                                {reservation.guest_name || "Guest Customer"}
                                            </div>
                                            <div className="text-muted-foreground text-sm">
                                                {reservation.guest_email || "No email provided"}
                                            </div>
                                            {reservation.guest_phone && (
                                                <div className="text-muted-foreground text-sm">
                                                    Phone: {reservation.guest_phone}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Confirmation Code */}
                        <div className="px-6 py-4">
                            <div className="flex items-start">
                                <svg className="text-primary mt-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div className="flex-grow">
                                    <div className="text-muted-foreground mb-1 text-xs font-medium uppercase">Confirmation Code</div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-foreground mb-1 text-base font-mono font-semibold">
                                            {reservation.confirmation_code || "Not generated"}
                                        </div>
                                        {reservation.confirmation_code && (
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(reservation.confirmation_code);
                                                    // Show a copy feedback
                                                    const button = document.activeElement as HTMLButtonElement;
                                                    const originalText = button.textContent;
                                                    button.textContent = "Copied!";
                                                    setTimeout(() => {
                                                        button.textContent = originalText;
                                                    }, 2000);
                                                }}
                                                className="text-primary hover:text-primary/80 ml-2 text-xs font-medium"
                                            >
                                                Copy
                                            </button>
                                        )}
                                    </div>
                                    <div className="text-muted-foreground text-sm">
                                        The customer can use this code to look up their reservation
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Seats */}
                        <div className="px-6 py-4">
                            <div className="flex items-start">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="text-primary mt-1 mr-3 h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-7-2h2"
                                    />
                                </svg>
                                <div>
                                    <div className="text-muted-foreground mb-1 text-xs font-medium uppercase">
                                        Seats ({reservation.reservationSeats?.length || 0})
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {reservation.reservationSeats?.map((reservationSeat) => (
                                            <span
                                                key={reservationSeat.id}
                                                className="border-border bg-background inline-flex items-center rounded-md border px-2.5 py-1 text-sm font-medium"
                                            >
                                                {reservationSeat.seat.row}-{reservationSeat.seat.number}
                                            </span>
                                        ))}
                                        {(!reservation.reservationSeats || reservation.reservationSeats.length === 0) && (
                                            <div>
                                                <span className="text-muted-foreground text-sm">No seat records found</span>
                                                {reservation.total_price > 0 && (
                                                    <div className="mt-2 text-sm">
                                                        <span className="text-warning">Note: </span>
                                                        <span className="text-muted-foreground">
                                                            This reservation has a total price of {formatCurrency(reservation.total_price)},
                                                            suggesting that it had seats that may have been lost due to a data issue.
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment */}
                        <div className="px-6 py-4">
                            <div className="flex items-start">
                                <CreditCardIcon className="text-primary mt-1 mr-3 h-5 w-5" />
                                <div>
                                    <div className="text-muted-foreground mb-1 text-xs font-medium uppercase">Payment</div>
                                    {reservation.payment ? (
                                        <>
                                            <div className="text-foreground mb-1 text-base font-semibold">
                                                {formatCurrency(reservation.payment.amount)}
                                            </div>
                                            <div className="text-muted-foreground mb-1 text-sm">Method: {reservation.payment.payment_method}</div>
                                            <div className="text-muted-foreground text-sm">Status: {reservation.payment.status}</div>
                                        </>
                                    ) : (
                                        <div className="text-foreground text-sm">No payment information</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="px-6 py-4">
                            <div className="flex items-start">
                                <CalendarIcon className="text-primary mt-1 mr-3 h-5 w-5" />
                                <div>
                                    <div className="text-muted-foreground mb-1 text-xs font-medium uppercase">Dates</div>
                                    <div className="text-muted-foreground text-sm">
                                        Created: {formatDate(reservation.created_at)} at {formatTime(reservation.created_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
                    <div className="border-border bg-muted border-b px-6 py-4">
                        <h3 className="text-foreground text-lg font-medium">Summary</h3>
                    </div>
                    <div className="px-6 py-4">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Ticket price:</span>
                                <span className="text-foreground">
                                    {formatCurrency(reservation.screening.price)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Number of seats:</span>
                                <span className="text-foreground">{reservation.reservationSeats?.length || 0}</span>
                            </div>
                            <div className="border-border mt-4 border-t pt-4">
                                <div className="flex justify-between font-medium">
                                    <span className="text-foreground">Total:</span>
                                    <span className="text-foreground text-lg">
                                        {formatCurrency(calculateTotalPrice())}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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

            {/* Status change modal */}
            {isStatusModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-card w-full max-w-md rounded-lg p-6 shadow-lg">
                        <div className="mb-4 flex items-center">
                            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                                <CreditCardIcon className="h-5 w-5" />
                            </div>
                            <h3 className="text-foreground ml-3 text-lg font-medium">Change Reservation Status</h3>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="status" className="text-foreground mb-1.5 block text-sm font-medium">
                                Status
                            </label>
                            <select
                                id="status"
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2"
                            >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            {newStatus === 'cancelled' && (
                                <p className="text-warning mt-2 text-sm">
                                    Note: Cancelling a reservation will release all reserved seats and make them available for other customers.
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsStatusModalOpen(false)}
                                className="border-border text-foreground hover:bg-muted rounded-md border px-4 py-2 text-sm font-medium focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmStatusChange}
                                className="bg-primary hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
