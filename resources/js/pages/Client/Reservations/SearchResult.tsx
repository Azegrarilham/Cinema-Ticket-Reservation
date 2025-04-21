import ClientLayout from '@/layouts/ClientLayout';
import { CalendarIcon, ClockIcon, FilmIcon, TicketIcon } from '@heroicons/react/24/outline';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

interface Seat {
    id: number;
    row: string;
    number: number;
}

interface Screening {
    id: number;
    start_time: string;
    room: string;
    film: {
        id: number;
        title: string;
        poster_image: string | null;
    };
}

interface Reservation {
    id: number;
    screening: Screening;
    confirmation_code: string;
    seats?: Seat[];
    total_price?: number;
    status: string;
    payment_status?: string;
    created_at: string;
}

interface SearchResultProps {
    reservation: Reservation;
}

export default function SearchResult({ reservation }: SearchResultProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    };

    const formatTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    // Default values for missing properties
    const paymentStatus = reservation.payment_status || 'pending';
    const totalPrice = reservation.total_price || 0;

    // Sort seats for display
    const sortedSeats = reservation.seats ? [...reservation.seats].sort((a, b) => {
        if (a.row !== b.row) {
            return a.row.localeCompare(b.row);
        }
        return a.number - b.number;
    }) : [];

    return (
        <ClientLayout>
            <Head title="Reservation Details | CineVerse" />

            <div className="py-20 bg-gradient-to-b from-gray-900 to-black">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-white">Your Reservation</h1>
                                <p className="text-gray-400">Here are the details of your reservation</p>
                            </div>
                            <Link
                                href={route('reservations.search')}
                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-800 border border-gray-700 rounded-md shadow-sm hover:bg-gray-700"
                            >
                                Search Again
                            </Link>
                        </div>

                        {/* Status banner */}
                        <div
                            className={`mb-8 p-4 rounded-md ${paymentStatus === 'completed'
                                ? 'bg-green-900/30 border border-green-700/50'
                                : 'bg-amber-900/30 border border-amber-700/50'
                                }`}
                        >
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    {paymentStatus === 'completed' ? (
                                        <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}
                                </div>
                                <div className="ml-3">
                                    <h3 className={paymentStatus === 'completed' ? 'text-green-400' : 'text-amber-400'}>
                                        {paymentStatus === 'completed'
                                            ? 'Confirmed Reservation'
                                            : 'Pending Payment'}
                                    </h3>
                                    <div className={paymentStatus === 'completed' ? 'text-green-300/70' : 'text-amber-300/70'}>
                                        {paymentStatus === 'completed'
                                            ? 'Your reservation is confirmed and ready to go. Please arrive 15 minutes before show time.'
                                            : 'Your reservation is not complete. Please make a payment to confirm your seats.'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main content */}
                        <div className="overflow-hidden border border-gray-700 rounded-lg shadow-xl">
                            {/* Film info */}
                            <div className="bg-gray-800 border-b border-gray-700">
                                <div className="flex items-center p-6">
                                    <div className="flex-shrink-0 hidden w-16 h-24 overflow-hidden border border-gray-700 rounded md:block">
                                        {reservation.screening.film.poster_image ? (
                                            <img
                                                src={
                                                    reservation.screening.film.poster_image.startsWith('http')
                                                        ? reservation.screening.film.poster_image
                                                        : `/storage/${reservation.screening.film.poster_image}`
                                                }
                                                alt={reservation.screening.film.title}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full bg-gray-900">
                                                <FilmIcon className="w-8 h-8 text-gray-600" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        <h2 className="text-lg font-medium text-white">{reservation.screening.film.title}</h2>
                                        <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-400">
                                            <div className="flex items-center">
                                                <CalendarIcon className="w-4 h-4 mr-1 text-gray-500" />
                                                <span>{formatDate(reservation.screening.start_time)}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <ClockIcon className="w-4 h-4 mr-1 text-gray-500" />
                                                <span>{formatTime(reservation.screening.start_time)}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="px-2 py-1 text-xs text-gray-300 bg-gray-700 rounded">
                                                    Room {reservation.screening.room}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ticket info */}
                            <div className="p-6 bg-gray-900">
                                <div className="pb-5 mb-5 border-b border-gray-800">
                                    <h3 className="text-lg font-medium text-white">Reservation Details</h3>
                                    <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                                        <div>
                                            <div className="text-sm font-medium text-gray-400">Confirmation Code</div>
                                            <div className="flex items-center mt-1">
                                                <TicketIcon className="w-5 h-5 mr-1.5 text-primary" />
                                                <span className="font-mono text-lg text-white">{reservation.confirmation_code}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-400">Reservation Date</div>
                                            <div className="flex items-center mt-1">
                                                <CalendarIcon className="w-5 h-5 mr-1.5 text-gray-500" />
                                                <span className="text-white">
                                                    {new Date(reservation.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pb-5 mb-5 border-b border-gray-800">
                                    <h3 className="text-lg font-medium text-white">Seats</h3>
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {sortedSeats && sortedSeats.length > 0 ? (
                                            sortedSeats.map((seat) => (
                                                <div
                                                    key={seat.id}
                                                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium border rounded-md bg-primary/10 text-primary border-primary/30"
                                                >
                                                    {seat.row}{seat.number}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-gray-400">No seat information available</div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-400">
                                        Total Amount
                                    </div>
                                    <div className="text-2xl font-bold text-white">
                                        ${totalPrice.toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between p-6 bg-gray-800 border-t border-gray-700">
                                {paymentStatus === 'completed' ? (
                                    <div className="flex gap-4">
                                        <a
                                            href={route('reservations.download-ticket', { reservation: reservation.id })}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                        >
                                            <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Download Ticket
                                        </a>
                                    </div>
                                ) : (
                                    <Link
                                        href={route('reservations.payment', { reservation: reservation.id })}
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                    >
                                        Complete Payment
                                    </Link>
                                )}
                                <Link
                                    href={route('films.show', { film: reservation.screening.film.id })}
                                    className="text-sm font-medium text-primary hover:text-primary/80"
                                >
                                    View Film Details
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </ClientLayout>
    );
}
