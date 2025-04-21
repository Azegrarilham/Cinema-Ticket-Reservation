import ClientLayout from '@/layouts/ClientLayout';
import UserIcon from '@heroicons/react/24/outline/UserIcon.js';
import CreditCardIcon from '@heroicons/react/24/outline/CreditCardIcon.js';
import Cog6ToothIcon from '@heroicons/react/24/outline/Cog6ToothIcon.js';
import ArrowLeftIcon from '@heroicons/react/24/outline/ArrowLeftIcon.js';
import TicketIcon from '@heroicons/react/24/outline/TicketIcon.js';
import { Head, Link } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Seat {
    id: number;
    row: string;
    number: number;
    status: string;
}

interface ReservationSeat {
    id: number;
    reservation_id: number;
    seat_id: number;
    price: number;
    seat: Seat;
}

interface Reservation {
    id: number | string;
    user_id?: number;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    status: string;
    total_price?: number | string;
    created_at: string;
    confirmation_code?: string;
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
    payment?: {
        id: number;
        status: string;
        payment_method: string;
        transaction_id: string;
        amount?: number | string;
    };
    reservationSeats?: ReservationSeat[];
    seats?: Seat[];
    payment_status?: string;
    screening: {
        id: number;
        start_time: string;
        room?: string;
        price?: number;
        film: {
            id: number;
            title: string;
            poster_url?: string;
            poster_image?: string;
            duration?: number;
        }
    }
}

interface Props {
    user?: User;
    reservation: Reservation;
}

export default function ReservationDetails({ user, reservation }: Props) {
    // Helper function to safely format prices
    const formatPrice = (price?: number | string): string => {
        if (price === undefined || price === null) return '0.00';

        // Convert to number if it's a string
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

        if (isNaN(numericPrice)) return '0.00';

        // Return formatted price
        return numericPrice.toFixed(2);
    };

    // Format date
    const screeningDate = new Date(reservation.screening.start_time);
    const formattedDate = screeningDate.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Format time
    const formattedTime = screeningDate.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Format seat numbers safely
    let seats: Seat[] = [];
    let seatLabels = '';

    try {
        // First try reservation.seats if available
        if (reservation.seats && reservation.seats.length > 0) {
            seats = reservation.seats;
        }
        // Then try reservationSeats
        else if (reservation.reservationSeats && reservation.reservationSeats.length > 0) {
            seats = reservation.reservationSeats.map(rs => rs.seat);
        }

        // Generate seat labels
        seatLabels = seats.map(seat => `${seat.row}${seat.number}`).sort().join(', ');
    } catch (error) {
        console.error('Error processing seats:', error);
        seats = [];
        seatLabels = 'Seat information unavailable';
    }

    // Handle case where user might be undefined
    if (!user) {
        return (
            <ClientLayout>
                <Head title="Reservation Details" />
                <div className="min-h-screen pt-8 pb-20 bg-gradient-to-b from-neutral-900 to-black">
                    <div className="container px-4 mx-auto">
                        <div className="p-8 text-center">
                            <h3 className="mt-4 text-lg font-medium text-white">Unable to load user information</h3>
                            <Link
                                href={route('login')}
                                className="inline-flex items-center px-4 py-2 mt-6 text-sm font-medium text-white transition-colors rounded-md bg-primary hover:bg-primary/90"
                            >
                                Return to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout>
            <Head title="Reservation Details" />

            <div className="min-h-screen pt-8 pb-20 bg-gradient-to-b from-neutral-900 to-black">
                <div className="container px-4 mx-auto">
                    <div className="flex items-center mb-8">
                        <Link href={route('account.reservations')} className="flex items-center mr-4 text-sm text-neutral-400 hover:text-white">
                            <ArrowLeftIcon className="w-4 h-4 mr-1" />
                            Back to Reservations
                        </Link>
                        <h1 className="text-3xl font-bold text-white">Reservation Details</h1>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {/* Sidebar */}
                        <div className="md:col-span-1">
                            <div className="p-6 border rounded-xl border-neutral-700 bg-neutral-800/50">
                                <div className="flex items-center mb-6 space-x-4">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary">
                                        <UserIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">{user.name}</h2>
                                        <p className="text-neutral-400">{user.email}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Link
                                        href={route('account.index')}
                                        className="flex items-center w-full p-3 transition-colors rounded-md text-neutral-300 hover:bg-neutral-700/30"
                                    >
                                        <UserIcon className="w-5 h-5 mr-3" />
                                        Profile
                                    </Link>
                                    <Link
                                        href={route('account.reservations')}
                                        className="flex items-center w-full p-3 transition-colors rounded-md bg-primary/10 text-primary"
                                    >
                                        <CreditCardIcon className="w-5 h-5 mr-3" />
                                        My Reservations
                                    </Link>
                                    <Link
                                        href={route('account.settings')}
                                        className="flex items-center w-full p-3 transition-colors rounded-md text-neutral-300 hover:bg-neutral-700/30"
                                    >
                                        <Cog6ToothIcon className="w-5 h-5 mr-3" />
                                        Settings
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Main content */}
                        <div className="md:col-span-2">
                            <div className="overflow-hidden border rounded-xl border-neutral-700 bg-neutral-800/50">
                                {/* Movie Banner */}
                                <div className="relative h-48 bg-gradient-to-r from-neutral-900 to-neutral-800">
                                    {(reservation.screening.film.poster_url || reservation.screening.film.poster_image) && (
                                        <div className="absolute inset-0 opacity-20">
                                            <img
                                                src={reservation.screening.film.poster_url || reservation.screening.film.poster_image || '/placeholder-poster.jpg'}
                                                alt={reservation.screening.film.title}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 flex items-center p-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-24 h-36 overflow-hidden rounded-md shadow-lg">
                                                <img
                                                    src={reservation.screening.film.poster_url || reservation.screening.film.poster_image || '/placeholder-poster.jpg'}
                                                    alt={reservation.screening.film.title}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                            <div className="ml-6">
                                                <h2 className="text-2xl font-bold text-white">{reservation.screening.film.title}</h2>
                                                <p className="mt-1 text-sm text-neutral-300">{formattedDate}</p>
                                                <p className="text-sm text-neutral-300">{formattedTime}</p>
                                                <div className="mt-3">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${reservation.status === 'confirmed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : reservation.status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {reservation.status.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Ticket Details */}
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-white">Reservation Details</h3>

                                    <div className="mt-4 space-y-4">
                                        {reservation.confirmation_code && (
                                            <div className="p-4 border rounded-md border-primary/30 bg-primary/10">
                                                <div className="flex items-center">
                                                    <TicketIcon className="w-5 h-5 mr-2 text-primary" />
                                                    <span className="font-medium text-white">Confirmation Code:</span>
                                                    <span className="ml-2 text-primary">{reservation.confirmation_code}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="p-4 border rounded-md border-neutral-700 bg-neutral-800">
                                                <p className="text-sm text-neutral-400">Seats</p>
                                                <p className="mt-1 font-medium text-white">{seatLabels}</p>
                                            </div>

                                            <div className="p-4 border rounded-md border-neutral-700 bg-neutral-800">
                                                <p className="text-sm text-neutral-400">Total Price</p>
                                                <p className="mt-1 font-medium text-white">${formatPrice(reservation.total_price)}</p>
                                            </div>

                                            {reservation.payment && (
                                                <div className="p-4 border rounded-md border-neutral-700 bg-neutral-800">
                                                    <p className="text-sm text-neutral-400">Payment Method</p>
                                                    <p className="mt-1 font-medium text-white capitalize">{reservation.payment.payment_method.replace('_', ' ')}</p>
                                                </div>
                                            )}

                                            <div className="p-4 border rounded-md border-neutral-700 bg-neutral-800">
                                                <p className="text-sm text-neutral-400">Reservation Date</p>
                                                <p className="mt-1 font-medium text-white">{new Date(reservation.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex mt-6 space-x-4">
                                        {reservation.status === 'confirmed' && (
                                            <a
                                                href={route('reservations.download-ticket', reservation.id)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-primary hover:bg-primary/90"
                                            >
                                                <TicketIcon className="w-4 h-4 mr-2" />
                                                Download Ticket
                                            </a>
                                        )}

                                        <Link
                                            href={route('account.reservations')}
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-md text-neutral-300 bg-neutral-700 hover:bg-neutral-600"
                                        >
                                            Back to Reservations
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
