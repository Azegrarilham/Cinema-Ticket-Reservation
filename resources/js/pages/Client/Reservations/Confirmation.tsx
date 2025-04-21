import ClientLayout from '@/layouts/ClientLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { route } from 'ziggy-js';
import {
    BadgeCheck,
    Calendar,
    Clock,
    Download,
    Home,
    Mail,
    MapPin,
    Phone,
    Ticket,
    User,
    AlertTriangle,
} from 'lucide-react';

interface Seat {
    id: number;
    row: string;
    number: number;
}

interface Reservation {
    id: string;
    confirmation_code: string;
    created_at: string;
    screening: {
        id: number;
        start_time: string;
        room: string;
        price: number;
        film: {
            id: number;
            title: string;
            poster_image: string;
        };
    };
    seats: Seat[];
    total_price: number | string;
    user_id?: number;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
    payment_status: 'pending' | 'completed' | 'failed';
}

interface ConfirmationProps {
    reservation: Reservation;
}

export default function Confirmation({ reservation }: ConfirmationProps) {
    // Get auth data for user information
    const { auth } = usePage().props as any;

    // Format dates and times
    const formatDate = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    };

    const formatTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    return (
        <ClientLayout>
            <Head title="Reservation Confirmed" />

            <div className="min-h-screen pt-8 pb-20 bg-gradient-to-b from-neutral-900 to-black">
                <div className="container px-4 mx-auto">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                        className="mb-12 text-center"
                    >
                        <div className="flex justify-center mb-6">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="relative"
                            >
                                <div className="absolute rounded-full opacity-75 -inset-1 bg-gradient-to-r from-red-500 to-red-700 blur-lg"></div>
                                <div className="relative flex items-center justify-center w-24 h-24 rounded-full shadow-xl bg-gradient-to-r from-red-600 to-red-700 shadow-red-500/20">
                                    <BadgeCheck className="text-white h-14 w-14" />
                                </div>
                            </motion.div>
                        </div>
                        <h1 className="text-4xl font-bold text-white">Reservation Confirmed!</h1>
                        <div className="w-24 h-1 mx-auto mt-4 rounded-full bg-gradient-to-r from-red-500 to-red-700"></div>
                        <p className="mt-6 text-lg text-neutral-400">Your seats have been reserved for {reservation.screening.film.title}</p>
                    </motion.div>

                    {reservation.payment_status === 'pending' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="max-w-3xl p-5 mx-auto mb-8 border shadow-lg rounded-xl border-yellow-500/20 bg-yellow-900/10"
                        >
                            <div className="flex items-start">
                                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
                                <div className="ml-3">
                                    <h3 className="text-base font-medium text-yellow-300">Payment Pending</h3>
                                    <div className="mt-2 text-sm text-yellow-200/80">
                                        <p>Please complete payment within 30 minutes to confirm your reservation.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {/* Confirmation code and movie details */}
                        <motion.div
                            className="md:col-span-1"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Confirmation code */}
                            <div className="mb-6 overflow-hidden border rounded-xl border-neutral-700 bg-gradient-to-b from-neutral-800/80 to-neutral-800/30 backdrop-blur-sm">
                                <div className="px-6 py-4 border-b border-neutral-700 bg-gradient-to-r from-neutral-800 to-neutral-900">
                                    <h2 className="flex items-center text-xl font-semibold text-white">
                                        <Ticket className="w-5 h-5 mr-2 text-red-500" />
                                        Confirmation
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="p-4 mb-4 text-center border rounded-lg border-neutral-700 bg-neutral-800/50">
                                        <p className="mb-1 text-sm text-neutral-400">Confirmation Code</p>
                                        <p className="text-2xl font-bold tracking-wider text-white">{reservation.confirmation_code}</p>
                                    </div>
                                    <div className="text-sm text-center text-neutral-500">
                                        {new Date(reservation.created_at).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Movie card */}
                            <div className="overflow-hidden border shadow-xl rounded-xl border-neutral-700 bg-gradient-to-b from-neutral-800/80 to-neutral-800/30 backdrop-blur-sm">
                                <div className="relative h-48 overflow-hidden">
                                    {reservation.screening.film.poster_image ? (
                                        <div className="absolute inset-0">
                                            <img
                                                src={reservation.screening.film.poster_image.startsWith('http')
                                                    ? reservation.screening.film.poster_image
                                                    : `/storage/${reservation.screening.film.poster_image}`}
                                                alt={reservation.screening.film.title}
                                                className="object-cover w-full h-full"
                                                onError={(e) => {
                                                    // Fallback to a placeholder if the image fails to load
                                                    e.currentTarget.src = 'https://via.placeholder.com/300x450?text=No+Poster';
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/80 to-neutral-900/20"></div>
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-b from-neutral-800 to-neutral-900"></div>
                                    )}
                                    <div className="absolute bottom-0 left-0 w-full p-6">
                                        <h3 className="text-2xl font-bold text-white">{reservation.screening.film.title}</h3>
                                    </div>
                                </div>
                                <div className="divide-y divide-neutral-700">
                                    <div className="flex items-center gap-3 p-4">
                                        <Calendar className="w-5 h-5 text-red-500/80" />
                                        <div className="text-sm text-neutral-300">
                                            {formatDate(reservation.screening.start_time)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4">
                                        <Clock className="w-5 h-5 text-red-500/80" />
                                        <div className="text-sm text-neutral-300">
                                            {formatTime(reservation.screening.start_time)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4">
                                        <MapPin className="w-5 h-5 text-red-500/80" />
                                        <div className="text-sm text-neutral-300">
                                            Room {reservation.screening.room}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Reservation details */}
                        <motion.div
                            className="md:col-span-2"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            {/* Seat information */}
                            <div className="mb-6 overflow-hidden border shadow-xl rounded-xl border-neutral-700 bg-gradient-to-b from-neutral-800/80 to-neutral-800/30 backdrop-blur-sm">
                                <div className="px-6 py-4 border-b border-neutral-700 bg-gradient-to-r from-neutral-800 to-neutral-900">
                                    <h2 className="flex items-center text-xl font-semibold text-white">
                                        <Ticket className="w-5 h-5 mr-2 text-red-500" />
                                        Seats Information
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="mb-8">
                                        <h3 className="mb-3 text-lg font-medium text-white">Your Seats</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {reservation.seats?.map((seat) => (
                                                <div
                                                    key={seat.id}
                                                    className="flex items-center justify-center h-10 text-sm font-medium text-white bg-red-600 rounded-md shadow-lg w-14 shadow-red-600/20"
                                                >
                                                    {seat.row}{seat.number}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Price breakdown */}
                                    <div className="p-5 border rounded-lg border-neutral-700 bg-neutral-800/50">
                                        <h3 className="mb-4 font-medium text-white">Price Details</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">Ticket price</span>
                                                <span className="font-medium text-white">
                                                    ${(() => {
                                                        if (typeof reservation.screening.price === 'number' && !isNaN(reservation.screening.price)) {
                                                            return reservation.screening.price.toFixed(2);
                                                        }
                                                        if (typeof reservation.screening.price === 'string') {
                                                            const parsed = parseFloat(reservation.screening.price);
                                                            if (!isNaN(parsed)) {
                                                                return parsed.toFixed(2);
                                                            }
                                                        }
                                                        return '0.00';
                                                    })()} each
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">Number of seats</span>
                                                <span className="font-medium text-white">{reservation.seats?.length || 0}</span>
                                            </div>
                                            <div className="pt-3 border-t border-neutral-700">
                                                <div className="flex justify-between">
                                                    <span className="text-lg font-medium text-white">Total</span>
                                                    <span className="text-lg font-bold text-red-500">
                                                        ${(() => {
                                                            if (typeof reservation.total_price === 'number' && !isNaN(reservation.total_price) && reservation.total_price > 0) {
                                                                return reservation.total_price.toFixed(2);
                                                            }

                                                            if (typeof reservation.total_price === 'string' && reservation.total_price && reservation.total_price !== '') {
                                                                const parsed = parseFloat(reservation.total_price);
                                                                if (!isNaN(parsed) && parsed > 0) {
                                                                    return parsed.toFixed(2);
                                                                }
                                                            }

                                                            // Calculate from price per seat and number of seats
                                                            const seatsCount = reservation.seats?.length || 0;
                                                            let pricePerSeat = 0;

                                                            if (typeof reservation.screening.price === 'number') {
                                                                pricePerSeat = reservation.screening.price;
                                                            } else if (typeof reservation.screening.price === 'string') {
                                                                pricePerSeat = parseFloat(reservation.screening.price) || 0;
                                                            }

                                                            const calculatedTotal = seatsCount * pricePerSeat;
                                                            return (calculatedTotal > 0) ? calculatedTotal.toFixed(2) : '0.00';
                                                        })()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Customer information */}
                            <div className="mb-6 overflow-hidden border shadow-xl rounded-xl border-neutral-700 bg-gradient-to-b from-neutral-800/80 to-neutral-800/30 backdrop-blur-sm">
                                <div className="px-6 py-4 border-b border-neutral-700 bg-gradient-to-r from-neutral-800 to-neutral-900">
                                    <h2 className="flex items-center text-xl font-semibold text-white">
                                        <User className="w-5 h-5 mr-2 text-red-500" />
                                        Customer Information
                                    </h2>
                                </div>
                                <div className="divide-y divide-neutral-700">
                                    <div className="flex items-center gap-3 p-4">
                                        <User className="w-5 h-5 text-neutral-500" />
                                        <div>
                                            <p className="text-xs text-neutral-500">Name</p>
                                            <p className="text-sm font-medium text-white">
                                                {reservation.guest_name ||
                                                    (reservation.user && reservation.user.name) ||
                                                    (auth.user && auth.user.name) ||
                                                    'Guest User'}
                                            </p>
                                        </div>
                                    </div>

                                    {(reservation.guest_email ||
                                        (reservation.user && reservation.user.email) ||
                                        (auth.user && auth.user.email)) && (
                                            <div className="flex items-center gap-3 p-4">
                                                <Mail className="w-5 h-5 text-neutral-500" />
                                                <div>
                                                    <p className="text-xs text-neutral-500">Email</p>
                                                    <p className="text-sm font-medium text-white">
                                                        {reservation.guest_email ||
                                                            (reservation.user && reservation.user.email) ||
                                                            (auth.user && auth.user.email)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                    {reservation.guest_phone && (
                                        <div className="flex items-center gap-3 p-4">
                                            <Phone className="w-5 h-5 text-neutral-500" />
                                            <div>
                                                <p className="text-xs text-neutral-500">Phone</p>
                                                <p className="text-sm font-medium text-white">{reservation.guest_phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <motion.div
                                className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                            >
                                <motion.div
                                    variants={fadeIn}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1"
                                >
                                    <Link
                                        href="/"
                                        className="flex items-center justify-center w-full px-4 py-3 text-base font-medium text-white transition-all rounded-md shadow-lg bg-gradient-to-r from-red-600 to-red-700 shadow-red-600/20 hover:from-red-700 hover:to-red-800"
                                    >
                                        <Home className="w-5 h-5 mr-2" />
                                        Return to Home
                                    </Link>
                                </motion.div>

                                <motion.div
                                    variants={fadeIn}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1"
                                >
                                    <a
                                        href={route('reservations.download-ticket', reservation.id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center w-full px-4 py-3 text-base font-medium text-white transition-all border rounded-md shadow-md border-neutral-600 bg-neutral-800 hover:bg-neutral-700"
                                    >
                                        <Download className="w-5 h-5 mr-2" />
                                        Download Ticket
                                    </a>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
