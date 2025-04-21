import ClientLayout from '@/layouts/ClientLayout';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    BanknoteIcon,
    CalendarIcon,
    ClockIcon,
    CreditCardIcon,
    FilmIcon,
    LoaderIcon,
    LockIcon,
    MapPinIcon,
    TicketIcon,
    UserIcon,
} from 'lucide-react';
import { useState } from 'react';

interface Seat {
    id: number;
    row: string;
    number: number;
}

interface ReservationSeat {
    id: number;
    seat: Seat;
    price: number;
}

interface Reservation {
    id: number;
    screening: {
        id: number;
        start_time: string;
        room: string;
        price: number;
        film: {
            id: number;
            title: string;
            poster_image: string;
            duration: number;
        };
    };
    reservationSeats: ReservationSeat[];
    total_price: number | string;
    user_id?: number;
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
    status: 'pending' | 'confirmed' | 'cancelled';
}

interface PaymentProps {
    reservation: Reservation;
}

export default function Payment({ reservation }: PaymentProps) {
    const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'paypal'>('credit_card');
    const [isProcessing, setIsProcessing] = useState(false);

    const form = useForm({
        payment_method: 'credit_card',
        card_number: '',
        card_expiry: '',
        card_cvv: '',
        cardholder_name: '',
    });

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

    // Format dates and times
    const formatDate = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    };

    const formatTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    // Format seats in a readable way
    const formatSeats = (reservationSeats: ReservationSeat[] | undefined) => {
        if (!reservationSeats || reservationSeats.length === 0) {
            return 'None';
        }

        return reservationSeats
            .map((rs) => rs.seat)
            .sort((a, b) => a.row.localeCompare(b.row) || a.number - b.number)
            .map((seat) => `${seat.row}${seat.number}`)
            .join(', ');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        form.data.payment_method = paymentMethod;

        form.post(route('reservations.process-payment', { reservation: reservation.id }), {
            onFinish: () => {
                setIsProcessing(false);
            },
        });
    };

    return (
        <ClientLayout>
            <Head title="Complete Payment" />

            <div className="min-h-screen pt-8 pb-20 bg-gradient-to-b from-neutral-900 to-black">
                <div className="container px-4 mx-auto">
                    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="mb-12 text-center">
                        <h1 className="text-4xl font-bold text-white">Complete Your Payment</h1>
                        <div className="w-24 h-1 mx-auto mt-4 rounded-full bg-gradient-to-r from-red-500 to-red-700"></div>
                        <p className="mt-6 text-lg text-neutral-400">Finalize your booking for {reservation.screening.film.title}</p>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {/* Reservation Summary */}
                        <motion.div
                            className="md:col-span-1"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="overflow-hidden border shadow-xl rounded-xl border-neutral-700 bg-neutral-800/50">
                                <div className="px-6 py-4 border-b border-neutral-700 bg-gradient-to-r from-neutral-800 to-neutral-900">
                                    <h2 className="flex items-center text-xl font-semibold text-white">
                                        <TicketIcon className="w-5 h-5 mr-2 text-red-500" />
                                        Booking Summary
                                    </h2>
                                </div>

                                {/* Movie details */}
                                <div className="p-6 border-b border-neutral-700 bg-gradient-to-b from-neutral-800/50 to-neutral-800/20">
                                    <div className="flex items-start">
                                        <div className="relative w-16 h-24 mr-4 overflow-hidden border rounded-md shadow-lg border-neutral-700">
                                            {reservation.screening.film.poster_image ? (
                                                <img
                                                    src={reservation.screening.film.poster_image.startsWith('http')
                                                        ? reservation.screening.film.poster_image
                                                        : `/storage/${reservation.screening.film.poster_image}`}
                                                    alt={reservation.screening.film.title}
                                                    className="object-cover object-center w-full h-full"
                                                    onError={(e) => {
                                                        // Fallback to a placeholder if the image fails to load
                                                        e.currentTarget.src = 'https://via.placeholder.com/300x450?text=No+Poster';
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full bg-neutral-900">
                                                    <FilmIcon className="w-8 h-8 text-neutral-600" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-white">{reservation.screening.film.title}</h3>
                                            <p className="mt-1 text-sm text-neutral-400">{reservation.screening.film.duration} minutes</p>

                                            <div className="mt-3 space-y-2">
                                                <div className="flex items-center text-sm text-neutral-300">
                                                    <CalendarIcon className="w-4 h-4 mr-2 text-red-500/80" />
                                                    {formatDate(reservation.screening.start_time)}
                                                </div>
                                                <div className="flex items-center text-sm text-neutral-300">
                                                    <ClockIcon className="w-4 h-4 mr-2 text-red-500/80" />
                                                    {formatTime(reservation.screening.start_time)}
                                                </div>
                                                <div className="flex items-center text-sm text-neutral-300">
                                                    <MapPinIcon className="w-4 h-4 mr-2 text-red-500/80" />
                                                    Room {reservation.screening.room}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Seats */}
                                <div className="px-6 py-4 border-b border-neutral-700">
                                    <h3 className="mb-3 font-medium text-white">Your Seats</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {reservation.reservationSeats?.map((rs) => (
                                            <div
                                                key={rs.id}
                                                className="flex items-center justify-center w-10 h-8 text-sm font-medium text-white bg-red-600 rounded-md shadow-lg"
                                            >
                                                {rs.seat.row}
                                                {rs.seat.number}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Price breakdown */}
                                <div className="px-6 py-4 space-y-3 text-neutral-300">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Price per seat</span>
                                        <span className="font-medium text-white">${Number(reservation.screening.price).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Number of seats</span>
                                        <span className="font-medium text-white">{reservation.reservationSeats?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between pt-3 text-lg font-bold border-t border-neutral-700">
                                        <span className="text-white">Total</span>
                                        <span className="text-red-500">
                                            ${typeof reservation.total_price === 'number'
                                                ? reservation.total_price.toFixed(2)
                                                : Number(reservation.total_price || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 mt-4 text-sm text-yellow-300 border rounded-xl border-yellow-500/20 bg-yellow-900/10">
                                <div className="flex">
                                    <LockIcon className="flex-shrink-0 w-5 h-5 text-yellow-400" />
                                    <div className="ml-3">
                                        <p>This is a demo application. No actual payments will be processed.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Payment Form */}
                        <motion.div
                            className="md:col-span-2"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="overflow-hidden border shadow-xl rounded-xl border-neutral-700 bg-neutral-800/50">
                                <div className="px-6 py-4 border-b border-neutral-700 bg-gradient-to-r from-neutral-800 to-neutral-900">
                                    <h2 className="flex items-center text-xl font-semibold text-white">
                                        <CreditCardIcon className="w-5 h-5 mr-2 text-red-500" />
                                        Payment Method
                                    </h2>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6">
                                    {/* Payment method selection */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div
                                            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-neutral-600 p-4 transition-colors ${paymentMethod === 'credit_card'
                                                    ? 'border-red-500 bg-red-500/10'
                                                    : 'hover:border-white/50 hover:bg-neutral-700/30'
                                                }`}
                                            onClick={() => setPaymentMethod('credit_card')}
                                        >
                                            <div
                                                className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full ${paymentMethod === 'credit_card' ? 'bg-red-500' : 'bg-neutral-700'
                                                    }`}
                                            >
                                                <CreditCardIcon className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="text-sm font-medium text-white">Credit Card</span>
                                        </div>

                                        <div
                                            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-neutral-600 p-4 transition-colors ${paymentMethod === 'paypal'
                                                    ? 'border-red-500 bg-red-500/10'
                                                    : 'hover:border-white/50 hover:bg-neutral-700/30'
                                                }`}
                                            onClick={() => setPaymentMethod('paypal')}
                                        >
                                            <div
                                                className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full ${paymentMethod === 'paypal' ? 'bg-red-500' : 'bg-neutral-700'
                                                    }`}
                                            >
                                                <BanknoteIcon className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="text-sm font-medium text-white">PayPal</span>
                                        </div>
                                    </div>

                                    {/* Credit Card Form */}
                                    {paymentMethod === 'credit_card' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-4"
                                        >
                                            <div>
                                                <label htmlFor="cardholder-name" className="block mb-2 text-sm font-medium text-neutral-300">
                                                    Cardholder Name
                                                </label>
                                                <div className="flex border rounded-md border-neutral-600 bg-neutral-700 focus-within:border-red-500">
                                                    <div className="flex items-center justify-center w-10 text-neutral-400">
                                                        <UserIcon className="w-4 h-4" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        id="cardholder-name"
                                                        name="cardholder_name"
                                                        value={form.data.cardholder_name}
                                                        onChange={(e) => form.setData('cardholder_name', e.target.value)}
                                                        className="w-full py-2 pl-0 pr-3 text-white bg-transparent border-0 rounded-r-md placeholder:text-neutral-400 focus:ring-0 focus:outline-none"
                                                        placeholder="Full Name"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="card-number" className="block mb-2 text-sm font-medium text-neutral-300">
                                                    Card Number
                                                </label>
                                                <div className="flex border rounded-md border-neutral-600 bg-neutral-700 focus-within:border-red-500">
                                                    <div className="flex items-center justify-center w-10 text-neutral-400">
                                                        <CreditCardIcon className="w-4 h-4" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        id="card-number"
                                                        name="card_number"
                                                        value={form.data.card_number}
                                                        onChange={(e) => form.setData('card_number', e.target.value)}
                                                        className="w-full py-2 pl-0 pr-3 text-white bg-transparent border-0 rounded-r-md placeholder:text-neutral-400 focus:ring-0 focus:outline-none"
                                                        placeholder="4242 4242 4242 4242"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="card-expiry" className="block mb-2 text-sm font-medium text-neutral-300">
                                                        Expiration Date
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="card-expiry"
                                                        name="card_expiry"
                                                        value={form.data.card_expiry}
                                                        onChange={(e) => form.setData('card_expiry', e.target.value)}
                                                        className="w-full px-3 py-2 text-white border rounded-md border-neutral-600 bg-neutral-700 placeholder:text-neutral-400 focus:border-red-500 focus:ring-0 focus:outline-none"
                                                        placeholder="MM/YY"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="card-cvv" className="block mb-2 text-sm font-medium text-neutral-300">
                                                        CVV
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="card-cvv"
                                                        name="card_cvv"
                                                        value={form.data.card_cvv}
                                                        onChange={(e) => form.setData('card_cvv', e.target.value)}
                                                        className="w-full px-3 py-2 text-white border rounded-md border-neutral-600 bg-neutral-700 placeholder:text-neutral-400 focus:border-red-500 focus:ring-0 focus:outline-none"
                                                        placeholder="123"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* PayPal Form */}
                                    {paymentMethod === 'paypal' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="p-6 text-center border rounded-md border-neutral-700 bg-neutral-800"
                                        >
                                            <p className="mb-2 text-neutral-300">
                                                You will be redirected to PayPal after clicking the payment button below.
                                            </p>
                                            <div className="flex items-center justify-center mt-4 text-neutral-400">
                                                <LockIcon className="w-4 h-4 mr-1" />
                                                <span className="text-xs">Secure connection</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Error messages */}
                                    {Object.keys(form.errors).length > 0 && (
                                        <div className="p-4 mt-4 text-red-300 rounded-md bg-red-900/30">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-red-300">Please fix the following errors:</h3>
                                                    <div className="mt-2 text-sm">
                                                        <ul className="pl-5 space-y-1 list-disc">
                                                            {Object.entries(form.errors).map(([key, value]) => (
                                                                <li key={key}>{value}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit button */}
                                    <motion.div className="mt-8" whileTap={{ scale: 0.98 }}>
                                        <button
                                            type="submit"
                                            className="w-full px-4 py-4 text-base font-semibold text-center text-white transition-all rounded-md shadow-lg bg-gradient-to-r from-red-600 to-red-700 shadow-red-600/20 hover:from-red-700 hover:to-red-800 disabled:opacity-70"
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? (
                                                <span className="flex items-center justify-center">
                                                    <LoaderIcon className="w-5 h-5 mr-2 animate-spin" />
                                                    Processing Payment...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center">
                                                    <LockIcon className="w-5 h-5 mr-2" />
                                                    Pay ${Number(reservation.total_price || 0).toFixed(2)} Securely
                                                </span>
                                            )}
                                        </button>
                                    </motion.div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
