import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Clock as ClockIcon,
    Mail as EnvelopeIcon,
    Film as FilmIcon,
    Loader as LoaderIcon,
    MapPin as MapPinIcon,
    Phone as PhoneIcon,
    Ticket as TicketIcon,
    User as UserIcon,
    ChevronsRight as NextIcon,
    X as XIcon,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { route } from 'ziggy-js';
import Button from '../../../components/ui/button';
import ClientLayout from '../../../layouts/ClientLayout';

interface Seat {
    id: number;
    row: string;
    number: number;
    status: 'available' | 'reserved' | 'sold';
}

interface Screening {
    id: number;
    film: {
        id: number;
        title: string;
        poster_image: string;
        duration: number;
    };
    start_time: string;
    room: string;
    price: number;
}

interface SeatSelectionProps {
    screening: Screening;
    seatsByRow: Record<string, Seat[]>;
}

interface PageProps {
    auth: {
        user: Record<string, unknown> | null;
    };
    errors: Record<string, string>;
    deferred?: Record<string, string[] | undefined>;
}

export default function SeatSelection({ screening, seatsByRow }: SeatSelectionProps) {
    const { auth } = usePage().props as unknown as PageProps;
    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
    const [showConfetti, setShowConfetti] = useState<boolean>(false);

    const form = useForm({
        seat_ids: [] as number[],
        guest_name: '',
        guest_email: '',
        guest_phone: '',
    });

    useEffect(() => {
        if (selectedSeats.length > 0 && selectedSeats.length % 2 === 0) {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [selectedSeats.length]);

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Format time
    const formatTime = (timeString: string) => {
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Handle seat selection
    const handleSeatSelect = (seat: Seat) => {
        if (seat.status !== 'available') return;

        const isSelected = selectedSeats.some((s) => s.id === seat.id);

        if (isSelected) {
            // Remove seat
            const newSelectedSeats = selectedSeats.filter((s) => s.id !== seat.id);
            setSelectedSeats(newSelectedSeats);
            form.setData(
                'seat_ids',
                newSelectedSeats.map((s) => s.id),
            );
        } else {
            // Add seat with animation
            const newSelectedSeats = [...selectedSeats, seat];
            setSelectedSeats(newSelectedSeats);
            form.setData(
                'seat_ids',
                newSelectedSeats.map((s) => s.id),
            );
        }
    };

    // Calculate total price
    const totalPrice = selectedSeats.length * screening.price;

    // Submit reservation
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedSeats.length === 0) {
            alert('Please select at least one seat to continue.');
            return;
        }

        // If user is not logged in, validate guest information
        if (!auth.user) {
            if (!form.data.guest_name || !form.data.guest_email) {
                alert('Please fill in your name and email to continue.');
                return;
            }
        }

        form.post(route('reservations.store', { screening: screening.id }), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Will redirect to payment page handled by controller
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
            },
        });
    };

    // Sort rows alphabetically
    const sortedRows = Object.keys(seatsByRow).sort();

    return (
        <ClientLayout>
            <Head title={`Select Seats - ${screening.film.title}`} />

            {/* Confetti effect when selecting seats */}
            {showConfetti && (
                <div className="fixed inset-0 z-50 pointer-events-none">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-confetti-1 absolute h-2 w-2 bg-yellow-400 rounded-full"></div>
                        <div className="animate-confetti-2 absolute h-2 w-2 bg-red-500 rounded-full"></div>
                        <div className="animate-confetti-3 absolute h-2 w-2 bg-blue-500 rounded-full"></div>
                        <div className="animate-confetti-4 absolute h-2 w-2 bg-green-500 rounded-full"></div>
                        <div className="animate-confetti-5 absolute h-2 w-2 bg-purple-500 rounded-full"></div>
                        <div className="animate-confetti-6 absolute h-2 w-2 bg-pink-500 rounded-full"></div>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 py-8">
                <h1 className="mb-8 relative text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                    <span className="animate-pulse-slow">Pick Your Perfect Spot</span>
                </h1>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Seat Selection Area */}
                    <div className="lg:col-span-2">
                        <div className="mb-6 overflow-hidden rounded-xl border border-neutral-700 bg-gradient-to-b from-neutral-800 to-neutral-900 shadow-lg shadow-red-500/10 transform transition duration-300 hover:shadow-red-500/20">
                            <div className="relative border-b border-neutral-700 bg-gradient-to-r from-red-900 to-neutral-900 px-6 py-4">
                                <h2 className="flex items-center text-xl font-semibold text-white">
                                    <TicketIcon className="mr-2 h-5 w-5 text-red-500 animate-pulse-slow" />
                                    Select Your Seats
                                </h2>

                                <div className="absolute right-4 top-4 flex space-x-2">
                                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                </div>
                            </div>
                            <div className="px-6 py-4">
                                {/* Screen */}
                                <div className="mb-10 pt-6 relative">
                                    <div className="absolute inset-0 bg-gradient-to-b from-red-500/20 to-transparent blur-md"></div>
                                    <div className="mx-auto mb-2 h-2 w-3/4 rounded-lg bg-red-500/30 animate-glow"></div>
                                    <div className="relative mx-auto h-8 w-2/3 rounded-t-3xl bg-gradient-to-r from-red-600/40 to-red-400/40 text-center text-xs font-bold text-white flex items-center justify-center">
                                        <span className="animate-text-flicker">CINEMA SCREEN</span>
                                    </div>
                                </div>

                                {/* Seating map */}
                                <div className="mb-6 overflow-x-auto pb-4">
                                    <div className="min-w-[600px]">
                                        {sortedRows.map((row) => (
                                            <div key={row} className="mb-3 flex items-center">
                                                <div className="mr-4 w-8 text-center text-sm font-medium text-red-400">{row}</div>
                                                <div className="flex flex-1 flex-wrap justify-center gap-2">
                                                    {seatsByRow[row].map((seat) => (
                                                        <button
                                                            key={seat.id}
                                                            onClick={() => handleSeatSelect(seat)}
                                                            disabled={seat.status !== 'available'}
                                                            className={`group flex h-10 w-10 items-center justify-center rounded-md text-xs font-medium transition-all duration-300 transform hover:scale-110 ${selectedSeats.some((s) => s.id === seat.id)
                                                                ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-md shadow-red-600/50 animate-pulse-slow'
                                                                : seat.status === 'available'
                                                                    ? 'bg-neutral-700 text-white hover:bg-neutral-600'
                                                                    : 'cursor-not-allowed bg-neutral-800 text-neutral-500'
                                                                }`}
                                                        >
                                                            <span className={selectedSeats.some((s) => s.id === seat.id) ? "animate-wiggle" : ""}>{seat.number}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="ml-4 w-8 text-center text-sm font-medium text-red-400">{row}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className="flex flex-wrap items-center justify-center gap-4 border-t border-neutral-700 pt-4 text-sm">
                                    <div className="flex items-center bg-neutral-800/50 p-2 rounded-md">
                                        <div className="mr-2 h-4 w-4 rounded bg-neutral-700"></div>
                                        <span className="text-neutral-300">Available</span>
                                    </div>
                                    <div className="flex items-center bg-neutral-800/50 p-2 rounded-md">
                                        <div className="mr-2 h-4 w-4 rounded bg-gradient-to-br from-red-600 to-red-700 animate-pulse"></div>
                                        <span className="text-neutral-300">Selected</span>
                                    </div>
                                    <div className="flex items-center bg-neutral-800/50 p-2 rounded-md">
                                        <div className="mr-2 h-4 w-4 rounded bg-neutral-800"></div>
                                        <span className="text-neutral-400">Unavailable</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 overflow-hidden rounded-xl border border-neutral-700 bg-gradient-to-b from-neutral-800 to-neutral-900 shadow-lg shadow-red-500/10 transition duration-300 hover:shadow-red-500/20">
                            <div className="relative border-b border-neutral-700 bg-gradient-to-r from-red-900 to-neutral-900 px-6 py-4">
                                <h2 className="flex items-center text-xl font-semibold text-white">
                                    <FilmIcon className="mr-2 h-5 w-5 text-red-500" />
                                    Your Movie Experience
                                </h2>
                                <div className="absolute right-4 top-4 flex space-x-2">
                                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                </div>
                            </div>

                            {/* Film info */}
                            <div className="border-b border-neutral-700 px-6 py-4 bg-gradient-to-r from-neutral-800 to-neutral-800/50">
                                <div className="flex items-start gap-4">
                                    {screening.film.poster_image && (
                                        <div className="w-20 h-28 rounded-md overflow-hidden shadow-lg shadow-black/40">
                                            <img
                                                src={screening.film.poster_image}
                                                alt={screening.film.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="mb-2 text-lg font-semibold text-white bg-clip-text bg-gradient-to-r from-white to-neutral-300">{screening.film.title}</h3>
                                        <div className="space-y-2 text-sm text-neutral-300">
                                            <div className="flex items-start">
                                                <ClockIcon className="mt-0.5 mr-3 h-4 w-4 text-red-400" />
                                                <div>
                                                    <p className="text-white">{formatTime(screening.start_time)}</p>
                                                    <p>{formatDate(screening.start_time)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <MapPinIcon className="mr-3 h-4 w-4 text-red-400" />
                                                <p>Room: <span className="text-white">{screening.room}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Selected seats */}
                            <div className="border-b border-neutral-700 px-6 py-4 bg-gradient-to-r from-neutral-800 to-neutral-800/50">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="text-base font-medium text-white">Selected Seats</h3>
                                    <span className="text-neutral-400 bg-neutral-700/50 px-2 py-0.5 rounded-full text-xs font-medium">
                                        {selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'}
                                    </span>
                                </div>
                                {selectedSeats.length > 0 ? (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {selectedSeats.map((seat) => (
                                            <div key={seat.id}
                                                className="group relative rounded-md bg-gradient-to-r from-red-700 to-red-600 px-2 py-1 text-sm text-white shadow-sm shadow-red-700/30 transition-all duration-300 hover:shadow-red-600/50"
                                                onClick={() => handleSeatSelect(seat)}
                                            >
                                                {seat.row}-{seat.number}
                                                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-neutral-900/80 rounded-md transition-all duration-300">
                                                    <XIcon className="h-3 w-3 text-white" />
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-neutral-800/50 rounded-lg p-3 text-sm text-neutral-400 border border-dashed border-neutral-700">
                                        <div className="flex items-center justify-center">
                                            <TicketIcon className="mr-2 h-4 w-4 text-neutral-500" />
                                            <p>Click on some seats to get started!</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Price summary */}
                            <div className="border-b border-neutral-700 px-6 py-4 bg-gradient-to-r from-neutral-800 to-neutral-800/50">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-300">Price per seat</span>
                                    <span className="text-white font-medium">${Number(screening.price).toFixed(2)}</span>
                                </div>
                                <div className="mt-4 flex items-center justify-between font-medium rounded-lg bg-gradient-to-r from-neutral-800 to-neutral-700 p-3">
                                    <span className="text-white">Total</span>
                                    <span className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 font-bold">${totalPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* User info form */}
                            <form onSubmit={handleSubmit}>
                                {!auth.user && (
                                    <div className="border-b border-neutral-700 px-6 py-4 bg-gradient-to-r from-neutral-800 to-neutral-800/50">
                                        <h3 className="mb-3 text-base font-medium text-white flex items-center">
                                            <UserIcon className="mr-2 h-4 w-4 text-red-500" />
                                            Guest Information
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="mb-1 block text-sm text-neutral-300" htmlFor="guest_name">
                                                    Name
                                                </label>
                                                <div className="flex rounded-md border border-neutral-600 bg-neutral-700 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/50 transition-all duration-300">
                                                    <div className="flex w-10 items-center justify-center text-neutral-400">
                                                        <UserIcon className="h-4 w-4" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        id="guest_name"
                                                        value={form.data.guest_name}
                                                        onChange={(e) => form.setData('guest_name', e.target.value)}
                                                        className="w-full rounded-r-md border-0 bg-transparent py-2 pr-3 pl-0 text-white placeholder:text-neutral-400 focus:ring-0 focus:outline-none"
                                                        placeholder="Full Name"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm text-neutral-300" htmlFor="guest_email">
                                                    Email
                                                </label>
                                                <div className="flex rounded-md border border-neutral-600 bg-neutral-700 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/50 transition-all duration-300">
                                                    <div className="flex w-10 items-center justify-center text-neutral-400">
                                                        <EnvelopeIcon className="h-4 w-4" />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        id="guest_email"
                                                        value={form.data.guest_email}
                                                        onChange={(e) => form.setData('guest_email', e.target.value)}
                                                        className="w-full rounded-r-md border-0 bg-transparent py-2 pr-3 pl-0 text-white placeholder:text-neutral-400 focus:ring-0 focus:outline-none"
                                                        placeholder="Email Address"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm text-neutral-300" htmlFor="guest_phone">
                                                    Phone (optional)
                                                </label>
                                                <div className="flex rounded-md border border-neutral-600 bg-neutral-700 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/50 transition-all duration-300">
                                                    <div className="flex w-10 items-center justify-center text-neutral-400">
                                                        <PhoneIcon className="h-4 w-4" />
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        id="guest_phone"
                                                        value={form.data.guest_phone}
                                                        onChange={(e) => form.setData('guest_phone', e.target.value)}
                                                        className="w-full rounded-r-md border-0 bg-transparent py-2 pr-3 pl-0 text-white placeholder:text-neutral-400 focus:ring-0 focus:outline-none"
                                                        placeholder="Phone Number"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {auth.user && (
                                    <div className="border-b border-neutral-700 px-6 py-4 bg-gradient-to-r from-neutral-800 to-neutral-800/50">
                                        <h3 className="mb-1 text-base font-medium text-white flex items-center">
                                            <UserIcon className="mr-2 h-4 w-4 text-red-500" />
                                            Logged in as
                                        </h3>
                                        <p className="text-sm text-neutral-300">{(auth.user as any).name} ({(auth.user as any).email})</p>
                                    </div>
                                )}

                                {/* Book button */}
                                <div className="px-6 py-4 bg-gradient-to-r from-neutral-800 to-neutral-800/50">
                                    <Button
                                        type="submit"
                                        disabled={selectedSeats.length === 0 || form.processing}
                                        className={`w-full transition-all duration-300 transform hover:scale-105 ${selectedSeats.length === 0 || form.processing
                                            ? 'bg-neutral-700 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-700/30 hover:shadow-red-600/50'
                                            }`}
                                    >
                                        {form.processing ? (
                                            <>
                                                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                {selectedSeats.length === 0 ? (
                                                    <>
                                                        <TicketIcon className="mr-2 h-4 w-4" />
                                                        Select seats to continue
                                                    </>
                                                ) : (
                                                    <>
                                                        <NextIcon className="mr-2 h-4 w-4" />
                                                        Continue to Payment
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
