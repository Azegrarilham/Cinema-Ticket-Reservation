import AdminLayout from '@/layouts/AdminLayout';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, CurrencyDollarIcon, FilmIcon, MapPinIcon, TicketIcon, UserIcon, WrenchIcon } from '@heroicons/react/24/outline';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

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

interface Screening {
    id: number;
    film: {
        id: number;
        title: string;
        duration: number;
    };
    start_time: string;
    room: string;
    price: number;
    total_seats: number;
    is_active: boolean;
    seats: Seat[];
    reservations: Reservation[];
}

interface Props {
    screening: Screening;
}

export default function Show({ screening }: Props) {
    const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);

    // Group seats by row
    const seatsByRow = screening.seats.reduce(
        (acc, seat) => {
            if (!acc[seat.row]) {
                acc[seat.row] = [];
            }
            acc[seat.row].push(seat);
            return acc;
        },
        {} as Record<string, Seat[]>,
    );

    // Sort seats within each row by number
    Object.keys(seatsByRow).forEach((row) => {
        seatsByRow[row].sort((a, b) => a.number - b.number);
    });

    // Sort rows alphabetically
    const sortedRows = Object.keys(seatsByRow).sort();

    // Calculate available and booked seats
    const availableSeats = screening.seats.filter((seat) => seat.status === 'available').length;
    const bookedSeats = screening.seats.filter((seat) => seat.status === 'booked' || seat.status === 'reserved').length;
    const hasSeatIssue = screening.seats.length === 0 || screening.seats.length !== screening.total_seats;

    // Format date and time
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
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

    // Safe currency formatter that handles invalid values
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

    const handleRepairSeats = () => {
        router.post(route('admin.screenings.repair-seats', { screening: screening.id }));
    };

    return (
        <AdminLayout title="Screening Details" subtitle="View screening information and seating">
            <Head title={`Screening - ${screening.film.title}`} />

            {/* Back button and actions */}
            <div className="mb-6 flex items-center justify-between">
                <Link
                    href={route('admin.screenings.index')}
                    className="border-border text-foreground hover:bg-muted inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium transition"
                >
                    <ArrowLeftIcon className="mr-1.5 h-4 w-4" />
                    Back to Screenings
                </Link>
                <div className="flex space-x-3">
                    <Link
                        href={route('admin.screenings.edit', { screening: screening.id })}
                        className="bg-warning hover:bg-warning/90 text-warning-foreground inline-flex items-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition"
                    >
                        Edit Screening
                    </Link>

                    {hasSeatIssue && (
                        <button
                            onClick={() => setIsRepairModalOpen(true)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground inline-flex items-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition"
                        >
                            <WrenchIcon className="mr-1.5 h-4 w-4" />
                            Repair Seats
                        </button>
                    )}
                </div>
            </div>

            {/* Warning message if seats issue */}
            {hasSeatIssue && (
                <div className="bg-amber-50 border-amber-200 text-amber-800 mb-6 rounded-md border p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <WrenchIcon className="h-5 w-5 text-amber-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-amber-800">Seat configuration issue detected</h3>
                            <div className="mt-2 text-sm text-amber-700">
                                <p>
                                    {screening.seats.length === 0
                                        ? "This screening doesn't have any seats configured."
                                        : `This screening has ${screening.seats.length} seats configured but should have ${screening.total_seats}.`}
                                    Click the "Repair Seats" button to fix this issue.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Screening Info Card */}
            <div className="border-border bg-card mb-8 overflow-hidden rounded-lg border shadow-sm">
                <div className="p-6">
                    <div className="mb-6 flex items-center">
                        <FilmIcon className="text-primary mr-3 h-8 w-8" />
                        <h2 className="text-foreground text-2xl font-bold">{screening.film.title}</h2>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-start">
                            <CalendarIcon className="text-muted-foreground mt-0.5 mr-3 h-5 w-5 flex-shrink-0" />
                            <div>
                                <h3 className="text-muted-foreground text-sm font-medium">Date</h3>
                                <p className="text-foreground font-medium">{formatDate(screening.start_time)}</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <ClockIcon className="text-muted-foreground mt-0.5 mr-3 h-5 w-5 flex-shrink-0" />
                            <div>
                                <h3 className="text-muted-foreground text-sm font-medium">Time</h3>
                                <p className="text-foreground font-medium">{formatTime(screening.start_time)}</p>
                                <p className="text-muted-foreground text-xs">{screening.film.duration} minutes</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <MapPinIcon className="text-muted-foreground mt-0.5 mr-3 h-5 w-5 flex-shrink-0" />
                            <div>
                                <h3 className="text-muted-foreground text-sm font-medium">Room</h3>
                                <p className="text-foreground font-medium">{screening.room}</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <CurrencyDollarIcon className="text-muted-foreground mt-0.5 mr-3 h-5 w-5 flex-shrink-0" />
                            <div>
                                <h3 className="text-muted-foreground text-sm font-medium">Price</h3>
                                <p className="text-foreground font-medium">{formatCurrency(screening.price)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-6 md:grid-cols-3">
                        <div className="border-border bg-background rounded-md border p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <h3 className="text-muted-foreground text-sm font-medium">Status</h3>
                                <span
                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${screening.is_active ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                                        }`}
                                >
                                    {screening.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        <div className="border-border bg-background rounded-md border p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <h3 className="text-muted-foreground text-sm font-medium">Seats</h3>
                                <span className="text-foreground text-sm font-medium">
                                    {availableSeats} / {screening.total_seats} available
                                </span>
                            </div>
                            <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                                <div className="bg-primary h-full" style={{ width: `${(availableSeats / screening.total_seats) * 100}%` }}></div>
                            </div>
                        </div>

                        <div className="border-border bg-background rounded-md border p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <h3 className="text-muted-foreground text-sm font-medium">Reservations</h3>
                                <span className="text-foreground text-sm font-medium">{screening.reservations.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seating Chart */}
            <div className="border-border bg-card mb-8 overflow-hidden rounded-lg border shadow-sm">
                <div className="border-border bg-muted/30 border-b px-6 py-4">
                    <h2 className="text-foreground flex items-center text-lg font-medium">
                        <TicketIcon className="text-primary mr-2 h-5 w-5" />
                        Seating Chart
                    </h2>
                </div>
                <div className="p-6">
                    <div className="mb-6 flex flex-wrap justify-center space-x-4">
                        <div className="mb-2 flex items-center">
                            <div className="bg-success mr-2 h-4 w-4 rounded-sm"></div>
                            <span className="text-muted-foreground text-sm">Available</span>
                        </div>
                        <div className="mb-2 flex items-center">
                            <div className="bg-warning mr-2 h-4 w-4 rounded-sm"></div>
                            <span className="text-muted-foreground text-sm">Reserved</span>
                        </div>
                        <div className="mb-2 flex items-center">
                            <div className="bg-destructive mr-2 h-4 w-4 rounded-sm"></div>
                            <span className="text-muted-foreground text-sm">Booked</span>
                        </div>
                    </div>

                    {/* Screen */}
                    <div className="mb-8 flex justify-center">
                        <div className="bg-primary/10 border-primary/30 relative w-3/4 rounded-sm border py-2 text-center">
                            <span className="text-primary text-sm font-medium">SCREEN</span>
                        </div>
                    </div>

                    {/* Seats */}
                    <div className="mb-4 overflow-x-auto">
                        <div className="flex min-w-max flex-col items-center space-y-3">
                            {sortedRows.map((row) => (
                                <div key={row} className="flex items-center">
                                    <div className="text-muted-foreground mr-4 w-4 text-center text-sm font-medium">{row}</div>
                                    <div className="flex space-x-2">
                                        {seatsByRow[row].map((seat) => (
                                            <div
                                                key={seat.id}
                                                className={`flex h-8 w-8 items-center justify-center rounded-sm text-xs font-medium ${seat.status === 'available'
                                                        ? 'bg-success/20 text-success'
                                                        : seat.status === 'reserved'
                                                            ? 'bg-warning/20 text-warning'
                                                            : 'bg-destructive/20 text-destructive'
                                                    }`}
                                                title={`Row ${seat.row}, Seat ${seat.number} - ${seat.status}`}
                                            >
                                                {seat.number}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reservations */}
            <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
                <div className="border-border bg-muted/30 border-b px-6 py-4">
                    <h2 className="text-foreground flex items-center text-lg font-medium">
                        <UserIcon className="text-primary mr-2 h-5 w-5" />
                        Reservations ({screening.reservations.length})
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    {screening.reservations.length > 0 ? (
                        <table className="divide-border min-w-full divide-y">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
                                    >
                                        Customer
                                    </th>
                                    <th
                                        scope="col"
                                        className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
                                    >
                                        Seats
                                    </th>
                                    <th
                                        scope="col"
                                        className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
                                    >
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
                                    >
                                        Total Price
                                    </th>
                                    <th
                                        scope="col"
                                        className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
                                    >
                                        Created At
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-border bg-card divide-y">
                                {screening.reservations.map((reservation) => (
                                    <tr key={reservation.id} className="hover:bg-muted/40 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-foreground text-sm font-medium">{reservation.customer_name}</div>
                                                <div className="text-muted-foreground text-xs">{reservation.customer_email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-foreground text-sm">
                                                {reservation.reservation_seats.map((rs) => (
                                                    <span
                                                        key={rs.id}
                                                        className="bg-primary/10 text-primary mr-1 inline-flex rounded-full px-2 py-0.5 text-xs"
                                                    >
                                                        {rs.seat.row}-{rs.seat.number}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${reservation.status === 'confirmed'
                                                        ? 'bg-success/20 text-success'
                                                        : reservation.status === 'pending'
                                                            ? 'bg-warning/20 text-warning'
                                                            : 'bg-destructive/20 text-destructive'
                                                    }`}
                                            >
                                                {reservation.status}
                                            </span>
                                        </td>
                                        <td className="text-foreground px-6 py-4 text-sm whitespace-nowrap">
                                            {formatCurrency(reservation.total_price)}
                                        </td>
                                        <td className="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap">
                                            {new Date(reservation.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-muted-foreground flex flex-col items-center justify-center py-12 text-center">
                            <TicketIcon className="text-muted-foreground mb-3 h-12 w-12" />
                            <p className="mb-1 text-sm">No reservations yet for this screening</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Repair seats confirmation modal */}
            {isRepairModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-card">
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
                                <span className="block mt-2 text-amber-500 font-medium">
                                    Warning: This screening has reservations that may be affected by repairing seats.
                                </span>
                            )}
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsRepairModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium border rounded-md border-border text-foreground hover:bg-muted focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRepairSeats}
                                className="px-4 py-2 text-sm font-medium rounded-md bg-primary hover:bg-primary/90 text-primary-foreground focus:outline-none"
                            >
                                Repair Seats
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

