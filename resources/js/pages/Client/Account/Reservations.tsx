import ClientLayout from '@/layouts/ClientLayout';
import Cog6ToothIcon from '@heroicons/react/24/outline/Cog6ToothIcon.js';
import CreditCardIcon from '@heroicons/react/24/outline/CreditCardIcon.js';
import UserIcon from '@heroicons/react/24/outline/UserIcon.js';
import { Head, Link } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Reservation {
    id: string | number;
    confirmation_code: string;
    reservation_code: string;
    status: string;
    created_at: string;
    screening: {
        id: number;
        start_time: string;
        room: string;
        film: {
            id: number;
            title: string;
            poster_image?: string;
        };
    };
    payment?: {
        status: string;
        amount: string | number;
        payment_method: string;
    };
    total_price?: number | string;
}

interface Props {
    user?: User;
    reservations: Reservation[];
}

export default function Reservations({ user, reservations = [] }: Props) {
    // Helper function to safely format price
    const formatPrice = (reservation: Reservation): string => {
        // If payment exists and has amount
        if (reservation.payment && reservation.payment.amount !== undefined) {
            // Handle string or number
            const amount = typeof reservation.payment.amount === 'string'
                ? parseFloat(reservation.payment.amount)
                : reservation.payment.amount;

            return isNaN(amount) ? '0.00' : amount.toFixed(2);
        }

        // Fall back to total_price
        if (reservation.total_price !== undefined) {
            const total = typeof reservation.total_price === 'string'
                ? parseFloat(reservation.total_price)
                : reservation.total_price;

            return isNaN(total) ? '0.00' : total.toFixed(2);
        }

        // Last resort
        return '0.00';
    };

    // Handle case where user might be undefined
    if (!user) {
        return (
            <ClientLayout>
                <Head title="My Reservations" />
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
            <Head title="My Reservations" />

            <div className="min-h-screen pt-8 pb-20 bg-gradient-to-b from-neutral-900 to-black">
                <div className="container px-4 mx-auto">
                    <h1 className="mb-8 text-3xl font-bold text-white">My Reservations</h1>

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
                            <div className="p-6 border rounded-xl border-neutral-700 bg-neutral-800/50">
                                <h2 className="mb-6 text-2xl font-semibold text-white">Your Cinema Reservations</h2>

                                {reservations.length > 0 ? (
                                    <div className="space-y-4">
                                        {reservations.map((reservation) => (
                                            <div
                                                key={reservation.id}
                                                className="p-4 transition-colors border rounded-lg border-neutral-700 hover:bg-neutral-700/30"
                                            >
                                                <div className="flex flex-col md:flex-row">
                                                    <div className="w-24 h-32 overflow-hidden rounded-md shrink-0">
                                                        <img
                                                            src={reservation.screening.film.poster_image || '/placeholder-poster.jpg'}
                                                            alt={reservation.screening.film.title}
                                                            className="object-cover w-full h-full"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col justify-between flex-1 p-4">
                                                        <div>
                                                            <h3 className="mb-1 text-lg font-medium text-white">
                                                                {reservation.screening.film.title}
                                                            </h3>
                                                            <p className="text-sm text-neutral-400">
                                                                {new Date(reservation.screening.start_time).toLocaleString()}
                                                            </p>
                                                            <div className="mt-2">
                                                                <span
                                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${reservation.status === 'completed'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : reservation.status === 'pending'
                                                                            ? 'bg-yellow-100 text-yellow-800'
                                                                            : 'bg-red-100 text-red-800'
                                                                        }`}
                                                                >
                                                                    {reservation.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-4">
                                                            <p className="text-sm font-medium text-white">
                                                                Total: ${formatPrice(reservation)}
                                                            </p>
                                                            <Link
                                                                href={route('account.reservations.show', reservation.id)}
                                                                className="inline-flex items-center px-3 py-1 text-xs font-medium text-white transition-colors rounded-md bg-primary hover:bg-primary/90"
                                                            >
                                                                View Details
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center border border-dashed rounded-lg border-neutral-700">
                                        <CreditCardIcon className="w-12 h-12 mx-auto text-neutral-500" />
                                        <h3 className="mt-4 text-lg font-medium text-white">No Reservations Found</h3>
                                        <p className="mt-2 text-neutral-400">You haven't made any reservations yet.</p>
                                        <Link
                                            href={route('films.index')}
                                            className="inline-flex items-center px-4 py-2 mt-6 text-sm font-medium text-white transition-colors rounded-md bg-primary hover:bg-primary/90"
                                        >
                                            Browse Films
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}

