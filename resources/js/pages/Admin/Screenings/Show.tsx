import React, { useState, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { CalendarIcon, ClockIcon, FilmIcon, TicketIcon, UserIcon } from '@heroicons/react/24/outline';
import ArrowLeftIcon from '@heroicons/react/24/outline/ArrowLeftIcon.js';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon.js';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon.js';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon.js';
import UsersIcon from '@heroicons/react/24/outline/UsersIcon.js';
import WrenchIcon from '@heroicons/react/24/outline/WrenchIcon.js';
import { motion } from 'framer-motion';
import { Head } from '@inertiajs/react';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            when: 'beforeChildren',
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 100 }
    },
};

interface Seat {
    id: number;
    screening_id: number;
    row: string;
    number: number;
    status: 'available' | 'reserved' | 'booked';
    created_at: string;
    updated_at: string;
}

interface Reservation {
    id: number;
    screening_id: number;
    user_id: number;
    customer_name: string;
    customer_email: string;
    status: string;
    total_price: number;
    created_at: string;
    updated_at: string;
    reservation_seats: {
        id: number;
        reservation_id: number;
        seat_id: number;
        seat: Seat;
    }[];
}

interface Film {
    id: number;
    title: string;
    duration: number;
    poster_url: string;
}

interface Screening {
    id: number;
    film_id: number;
    film: Film;
    start_time: string;
    formatted_start_time: string;
    formatted_end_time: string;
    formatted_date: string;
    room: string;
    price: string;
    tickets_sold: number;
    tickets_available: number;
    total_seats: number;
    is_active: boolean;
    seats: Seat[];
    reservations: Reservation[];
}

interface Props {
    screening: Screening;
    reservations?: Reservation[];
}

export default function Show({ screening, reservations }: Props) {
    const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);

    // Group seats by row
    const seatsByRow: Record<string, Seat[]> = {};
    screening.seats.forEach((seat) => {
        if (!seatsByRow[seat.row]) {
            seatsByRow[seat.row] = [];
        }
        seatsByRow[seat.row].push(seat);
    });

    // Sort rows alphabetically and then numerically
    const sortedRows = Object.keys(seatsByRow).sort((a, b) => {
        // If both are letters
        if (isNaN(parseInt(a)) && isNaN(parseInt(b))) {
            return a.localeCompare(b);
        }
        // If both are numbers
        if (!isNaN(parseInt(a)) && !isNaN(parseInt(b))) {
            return parseInt(a) - parseInt(b);
        }
        // Letters come before numbers
        return isNaN(parseInt(a)) ? -1 : 1;
    });

    // Calculate available and booked seats
    const availableSeats = screening.seats.filter((seat) => seat.status === 'available').length;
    const bookedSeats = screening.seats.filter((seat) => seat.status === 'booked').length;
    const reservedSeats = screening.seats.filter((seat) => seat.status === 'reserved').length;

    const formatCurrency = (value: number | null): string => {
        if (value === null || isNaN(value)) return "$0.00";
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    const handleRepairSeats = () => {
        router.post(`/admin/screenings/${screening.id}/repair-seats`, {}, {
            onSuccess: () => {
                setIsRepairModalOpen(false);
            },
        });
    };

    const totalRevenue = useMemo(
        () =>
            (reservations || screening.reservations).reduce(
                (total, reservation) => total + reservation.total_price,
                0
            ),
        [reservations, screening.reservations]
    );

    return (
        <AdminLayout title={`Screening Details: ${screening.film.title}`} subtitle="View screening information and ticket sales">
            <Head title={`Screening: ${screening.film.title}`} />

            <motion.div
                className="container px-4 py-6 mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Back link */}
                <motion.div className="mb-6" variants={itemVariants}>
                    <Link
                        href={route('admin.screenings.index')}
                        className="flex items-center text-sm transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-1" />
                        Back to Screenings
                    </Link>
                </motion.div>

                {/* Header */}
                <motion.div className="flex flex-col mb-8 md:flex-row md:items-center md:justify-between" variants={itemVariants}>
                    <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-lg bg-primary/10">
                            <FilmIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="mb-1 text-2xl font-bold text-foreground">{screening.film.title}</h1>
                            <p className="text-sm text-muted-foreground">
                                {screening.formatted_date || 'No date'} | {screening.formatted_start_time || 'No time'} | Room {screening.room || 'Unassigned'}
                            </p>
                </div>
            </div>

                    <motion.div
                        className="flex mt-4 space-x-3 md:mt-0"
                        variants={itemVariants}
                    >
                        <Link
                            href={route('admin.screenings.edit', screening.id)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition rounded-md bg-primary hover:bg-primary/90"
                        >
                            <PencilIcon className="w-4 h-4 mr-2" />
                            Edit
                        </Link>
                    </motion.div>
                </motion.div>

                <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3">
                    {/* Screening Details */}
                    <motion.div
                        className="overflow-hidden border rounded-lg shadow-sm col-span-full lg:col-span-2 border-border bg-card"
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-6 py-4 border-b border-border bg-muted/30">
                            <h2 className="flex items-center text-lg font-medium text-foreground">
                                <FilmIcon className="w-5 h-5 mr-2 text-primary" />
                                Screening Details
                            </h2>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <motion.div
                                    className="overflow-hidden border rounded-lg bg-muted/10 border-border"
                                    variants={itemVariants}
                                    whileHover={{ y: -3 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="px-4 py-3 border-b border-border">
                                        <h3 className="flex items-center text-sm font-medium text-foreground">
                                            <FilmIcon className="w-4 h-4 mr-2 text-primary" />
                                            Film Information
                                        </h3>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="flex">
                                            {screening.film.poster_url ? (
                                                <img
                                                    src={screening.film.poster_url}
                                                    alt={screening.film.title}
                                                    className="object-cover w-20 rounded-md shadow-sm h-30"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-20 rounded-md h-30 bg-muted">
                                                    <FilmIcon className="w-8 h-8 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="ml-4">
                                                <h4 className="font-medium text-foreground">{screening.film.title}</h4>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {screening.film.duration} minutes
                                                </p>
                                                <div className="mt-2">
                                                    <Link
                                                        href={route('admin.films.show', screening.film.id)}
                                                        className="inline-flex items-center text-xs text-primary hover:text-primary/80"
                                                    >
                                                        <EyeIcon className="w-3 h-3 mr-1" />
                                                        View Film Details
                                                    </Link>
                            </div>
                        </div>
                    </div>
                </div>
                                </motion.div>

                                <motion.div
                                    className="overflow-hidden border rounded-lg bg-muted/10 border-border"
                                    variants={itemVariants}
                                    whileHover={{ y: -3 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="px-4 py-3 border-b border-border">
                                        <h3 className="flex items-center text-sm font-medium text-foreground">
                                            <ClockIcon className="w-4 h-4 mr-2 text-primary" />
                                            Time and Location
                                        </h3>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="flex items-start">
                                            <CalendarIcon className="w-5 h-5 mt-0.5 text-muted-foreground" />
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-foreground">Date</p>
                                                <p className="text-sm text-muted-foreground">{screening.formatted_date || 'Not specified'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <ClockIcon className="w-5 h-5 mt-0.5 text-muted-foreground" />
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-foreground">Time</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {screening.formatted_start_time || 'Not specified'} - {screening.formatted_end_time || 'Not specified'}
                                                </p>
                                            </div>
                    </div>
                        <div className="flex items-start">
                                            <FilmIcon className="w-5 h-5 mt-0.5 text-muted-foreground" />
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-foreground">Room</p>
                                                <p className="text-sm text-muted-foreground">{screening.room || 'Unassigned'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Ticket Sales Summary */}
                    <motion.div
                        className="overflow-hidden border rounded-lg shadow-sm col-span-full lg:col-span-1 border-border bg-card"
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-6 py-4 border-b border-border bg-muted/30">
                            <h2 className="flex items-center text-lg font-medium text-foreground">
                                <TicketIcon className="w-5 h-5 mr-2 text-primary" />
                                Ticket Sales
                            </h2>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                <motion.div
                                    className="p-4 border rounded-lg bg-primary/5 border-primary/20"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex items-center justify-between">
                            <div>
                                            <p className="text-xs font-medium text-primary">Ticket Price</p>
                                            <div className="flex items-center mt-1 text-lg font-semibold text-primary">
                                                <CurrencyDollarIcon className="w-5 h-5 mr-1" />
                                                {screening.price && !isNaN(parseFloat(screening.price)) ?
                                                    formatCurrency(parseFloat(screening.price)) :
                                                    '$0.00'}
                            </div>
                        </div>
                            <div>
                                            <p className="text-xs font-medium text-primary">Status</p>
                                            <div className="flex items-center mt-1">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${screening.is_active
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'
                                                    }`}>
                                                    {screening.is_active ? 'Active' : 'Inactive'}
                                                </span>
                            </div>
                        </div>
                    </div>
                                </motion.div>

                                <motion.div
                                    className="p-4 border rounded-lg bg-muted/10 border-border"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <h3 className="text-sm font-medium text-foreground">Sales Overview</h3>
                                    <div className="mt-3 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <TicketIcon className="w-4 h-4 text-muted-foreground" />
                                                <span className="ml-2 text-sm text-foreground">Total Seats</span>
                                            </div>
                                            <span className="font-medium text-foreground">{screening.total_seats}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <UsersIcon className="w-4 h-4 text-muted-foreground" />
                                                <span className="ml-2 text-sm text-foreground">Tickets Sold</span>
                                            </div>
                                            <span className="font-medium text-foreground">{screening.tickets_sold}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <TicketIcon className="w-4 h-4 text-muted-foreground" />
                                                <span className="ml-2 text-sm text-foreground">Available</span>
                                            </div>
                                            <span className="font-medium text-foreground">{screening.tickets_available}</span>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-muted-foreground">
                                                Occupancy Rate: {(screening.total_seats > 0 && !isNaN(screening.tickets_sold)) ?
                                                    Math.round((screening.tickets_sold / screening.total_seats) * 100) : 0}%
                                            </span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-muted">
                                            <motion.div
                                                className="h-2 rounded-full bg-primary"
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${(screening.total_seats > 0 && !isNaN(screening.tickets_sold)) ?
                                                        Math.round((screening.tickets_sold / screening.total_seats) * 100) : 0}%`
                                                }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="p-4 border rounded-lg bg-muted/10 border-border"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <h3 className="text-sm font-medium text-foreground">Revenue</h3>
                                    <div className="mt-3 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <CurrencyDollarIcon className="w-4 h-4 text-muted-foreground" />
                                                <span className="ml-2 text-sm text-foreground">Total Revenue</span>
                                            </div>
                                            <span className="font-medium text-foreground">
                                                {formatCurrency(totalRevenue)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <CurrencyDollarIcon className="w-4 h-4 text-muted-foreground" />
                                                <span className="ml-2 text-sm text-foreground">Potential Revenue</span>
                                            </div>
                                            <span className="font-medium text-foreground">
                                                {formatCurrency(
                                                    (screening.price && screening.total_seats &&
                                                        !isNaN(parseFloat(screening.price)) &&
                                                        !isNaN(screening.total_seats)) ?
                                                        parseFloat(screening.price) * screening.total_seats : 0
                                                )}
                                </span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                        </div>

                {/* Seat Statistics */}
                <motion.div
                    className="mb-8 overflow-hidden border rounded-lg shadow-sm border-border bg-card"
                    variants={itemVariants}
                >
                    <div className="px-6 py-4 border-b border-border bg-muted/30">
                        <h2 className="flex items-center text-lg font-medium text-foreground">
                            <TicketIcon className="w-5 h-5 mr-2 text-primary" />
                            Seat Statistics
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
                        <motion.div className="p-4 rounded-md bg-muted/20" whileHover={{ y: -5 }}>
                            <div className="mb-1 text-xs font-medium text-muted-foreground">Total Seats</div>
                            <div className="text-xl font-bold text-foreground">{screening.total_seats}</div>
                            <div className="w-full h-2 mt-2 overflow-hidden bg-gray-200 rounded-full">
                                <motion.div
                                    className="h-full bg-gray-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 1 }}
                                ></motion.div>
                            </div>
                        </motion.div>
                        <motion.div className="p-4 rounded-md bg-muted/20" whileHover={{ y: -5 }}>
                            <div className="mb-1 text-xs font-medium text-muted-foreground">Available</div>
                            <div className="text-xl font-bold text-success">{availableSeats}</div>
                            <div className="w-full h-2 mt-2 overflow-hidden bg-gray-200 rounded-full">
                                <motion.div
                                    className="h-full bg-green-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${(screening.total_seats > 0 && !isNaN(availableSeats)) ?
                                            (availableSeats / screening.total_seats) * 100 : 0}%`
                                    }}
                                    transition={{ duration: 1 }}
                                ></motion.div>
                            </div>
                        </motion.div>
                        <motion.div className="p-4 rounded-md bg-muted/20" whileHover={{ y: -5 }}>
                            <div className="mb-1 text-xs font-medium text-muted-foreground">Booked/Reserved</div>
                            <div className="text-xl font-bold text-destructive">{bookedSeats + reservedSeats}</div>
                            <div className="w-full h-2 mt-2 overflow-hidden bg-gray-200 rounded-full">
                                <motion.div
                                    className="h-full bg-red-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${(screening.total_seats > 0 && !isNaN(bookedSeats) && !isNaN(reservedSeats)) ?
                                            ((bookedSeats + reservedSeats) / screening.total_seats) * 100 : 0}%`
                                    }}
                                    transition={{ duration: 1 }}
                                ></motion.div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

            {/* Seating Chart */}
                <motion.div
                    className="mb-8 overflow-hidden border rounded-lg shadow-sm border-border bg-card"
                    variants={itemVariants}
                >
                    <div className="px-6 py-4 border-b border-border bg-muted/30">
                        <h2 className="flex items-center text-lg font-medium text-foreground">
                            <TicketIcon className="w-5 h-5 mr-2 text-primary" />
                        Seating Chart
                    </h2>
                </div>
                <div className="p-6">
                        <motion.div className="flex flex-wrap justify-center mb-6 space-x-4">
                            <motion.div className="flex items-center mb-2" whileHover={{ scale: 1.05 }}>
                                <div className="w-4 h-4 mr-2 rounded-sm bg-success"></div>
                                <span className="text-sm text-muted-foreground">Available</span>
                            </motion.div>
                            <motion.div className="flex items-center mb-2" whileHover={{ scale: 1.05 }}>
                                <div className="w-4 h-4 mr-2 rounded-sm bg-warning"></div>
                                <span className="text-sm text-muted-foreground">Reserved</span>
                            </motion.div>
                            <motion.div className="flex items-center mb-2" whileHover={{ scale: 1.05 }}>
                                <div className="w-4 h-4 mr-2 rounded-sm bg-destructive"></div>
                                <span className="text-sm text-muted-foreground">Booked</span>
                            </motion.div>
                        </motion.div>

                    {/* Screen */}
                        <motion.div
                            className="flex justify-center mb-8"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="relative w-3/4 py-2 text-center border rounded-sm bg-primary/10 border-primary/30">
                                <span className="text-sm font-medium text-primary">SCREEN</span>
                        </div>
                        </motion.div>

                    {/* Seats */}
                    <div className="mb-4 overflow-x-auto">
                            <motion.div
                                className="flex flex-col items-center space-y-3 min-w-max"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5, staggerChildren: 0.1 }}
                            >
                            {sortedRows.map((row) => (
                                    <motion.div
                                        key={row}
                                        className="flex items-center"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ type: "spring" }}
                                    >
                                        <div className="w-4 mr-4 text-sm font-medium text-center text-muted-foreground">{row}</div>
                                    <div className="flex space-x-2">
                                        {seatsByRow[row].map((seat) => (
                                                <motion.div
                                                key={seat.id}
                                                className={`flex h-8 w-8 items-center justify-center rounded-sm text-xs font-medium ${seat.status === 'available'
                                                        ? 'bg-success/20 text-success'
                                                        : seat.status === 'reserved'
                                                            ? 'bg-warning/20 text-warning'
                                                            : 'bg-destructive/20 text-destructive'
                                                    }`}
                                                title={`Row ${seat.row}, Seat ${seat.number} - ${seat.status}`}
                                                    whileHover={{ scale: 1.2 }}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ type: "spring" }}
                                            >
                                                {seat.number}
                                                </motion.div>
                                        ))}
                                    </div>
                                    </motion.div>
                            ))}
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

            {/* Reservations */}
                <motion.div
                    className="overflow-hidden border rounded-lg shadow-sm border-border bg-card"
                    variants={itemVariants}
                >
                    <div className="px-6 py-4 border-b border-border bg-muted/30">
                        <h2 className="flex items-center text-lg font-medium text-foreground">
                            <UserIcon className="w-5 h-5 mr-2 text-primary" />
                            Reservations ({reservations?.length || screening.reservations.length})
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    {screening.reservations.length > 0 ? (
                            <table className="min-w-full divide-y divide-border">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th
                                        scope="col"
                                            className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground"
                                    >
                                        Customer
                                    </th>
                                    <th
                                        scope="col"
                                            className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground"
                                    >
                                        Seats
                                    </th>
                                    <th
                                        scope="col"
                                            className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground"
                                    >
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                            className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground"
                                    >
                                        Total Price
                                    </th>
                                    <th
                                        scope="col"
                                            className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground"
                                    >
                                        Created At
                                    </th>
                                </tr>
                            </thead>
                                <tbody className="divide-y divide-border bg-card">
                                    {screening.reservations.map((reservation, index) => (
                                        <motion.tr
                                            key={reservation.id}
                                            className="transition-colors hover:bg-muted/40"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                                        >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                    <div className="text-sm font-medium text-foreground">{reservation.customer_name}</div>
                                                    <div className="text-xs text-muted-foreground">{reservation.customer_email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-foreground">
                                                {reservation.reservation_seats.map((rs) => (
                                                        <motion.span
                                                        key={rs.id}
                                                        className="bg-primary/10 text-primary mr-1 inline-flex rounded-full px-2 py-0.5 text-xs"
                                                            whileHover={{ scale: 1.1 }}
                                                    >
                                                        {rs.seat.row}-{rs.seat.number}
                                                        </motion.span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <motion.span
                                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${reservation.status === 'confirmed'
                                                        ? 'bg-success/20 text-success'
                                                        : reservation.status === 'pending'
                                                            ? 'bg-warning/20 text-warning'
                                                            : 'bg-destructive/20 text-destructive'
                                                    }`}
                                                    whileHover={{ scale: 1.1 }}
                                            >
                                                {reservation.status}
                                                </motion.span>
                                        </td>
                                            <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                                            {formatCurrency(reservation.total_price)}
                                        </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                                            {new Date(reservation.created_at).toLocaleString()}
                                        </td>
                                        </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                            <motion.div
                                className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <TicketIcon className="w-12 h-12 mb-3 text-muted-foreground" />
                            <p className="mb-1 text-sm">No reservations yet for this screening</p>
                            </motion.div>
                    )}
                </div>
                </motion.div>

            {/* Repair seats confirmation modal */}
            {isRepairModalOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="w-full max-w-md p-6 rounded-lg shadow-lg bg-card"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                        <div className="flex items-center mb-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                                <WrenchIcon className="w-5 h-5" />
                            </div>
                            <h3 className="ml-3 text-lg font-medium text-foreground">Repair Seats</h3>
                        </div>

                        <p className="mb-6 text-muted-foreground">
                            {screening.seats.length === 0
                                ? `This will create ${screening.total_seats} new seats for this screening.`
                                : `This will delete all ${screening.seats.length} existing seats and create ${screening.total_seats} new seats.`}
                            {screening.reservations.length > 0 && (
                                    <span className="block mt-2 font-medium text-amber-500">
                                    Warning: This screening has reservations that may be affected by repairing seats.
                                </span>
                            )}
                        </p>

                        <div className="flex justify-end space-x-3">
                                <motion.button
                                onClick={() => setIsRepairModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium border rounded-md border-border text-foreground hover:bg-muted focus:outline-none"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                            >
                                Cancel
                                </motion.button>
                                <motion.button
                                onClick={handleRepairSeats}
                                className="px-4 py-2 text-sm font-medium rounded-md bg-primary hover:bg-primary/90 text-primary-foreground focus:outline-none"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                            >
                                Repair Seats
                                </motion.button>
                        </div>
                        </motion.div>
                    </motion.div>
            )}
            </motion.div>
        </AdminLayout>
    );
}

