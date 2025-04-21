import AdminLayout from '@/layouts/AdminLayout';
import { CalendarIcon, ClockIcon, FilmIcon } from '@heroicons/react/24/outline';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

interface Film {
    id: number;
    title: string;
    duration: number;
}

interface Props {
    films: Film[];
}

export default function Create({ films }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        film_id: '',
        start_time: '',
        start_time_hour: '18',
        start_time_minute: '00',
        room: '',
        total_seats: '120',
        price: '',
        is_active: true,
        seat_layout: {
            rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
            seats_per_row: 15,
        },
    });

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);

    useEffect(() => {
        // When film_id changes, find the selected film
        if (data.film_id) {
            const film = films.find((f) => f.id.toString() === data.film_id);
            setSelectedFilm(film || null);
        } else {
            setSelectedFilm(null);
        }
    }, [data.film_id, films]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Combine date and time for start_time
        if (selectedDate) {
            const formattedDateTime = `${selectedDate}T${data.start_time_hour}:${data.start_time_minute}:00`;
            setData('start_time', formattedDateTime);
        }

        post(route('admin.screenings.store'), {
            onSuccess: () => reset(),
        });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
        // Also update the start_time when date changes
        if (e.target.value) {
            const formattedDateTime = `${e.target.value}T${data.start_time_hour}:${data.start_time_minute}:00`;
            setData('start_time', formattedDateTime);
        }
    };

    const handleTimeChange = (type: 'hour' | 'minute', value: string) => {
        if (type === 'hour') {
            setData('start_time_hour', value);
        } else {
            setData('start_time_minute', value);
        }

        // Update the start_time when time changes
        if (selectedDate) {
            const hour = type === 'hour' ? value : data.start_time_hour;
            const minute = type === 'minute' ? value : data.start_time_minute;
            const formattedDateTime = `${selectedDate}T${hour}:${minute}:00`;
            setData('start_time', formattedDateTime);
        }
    };

    const generateTimeOptions = (type: 'hour' | 'minute') => {
        const options = [];
        const max = type === 'hour' ? 23 : 59;
        const step = type === 'hour' ? 1 : 5;

        for (let i = 0; i <= max; i += step) {
            const value = i.toString().padStart(2, '0');
            options.push(
                <option key={value} value={value}>
                    {value}
                </option>,
            );
        }

        return options;
    };

    const updateSeatLayout = (type: 'rows' | 'seats_per_row', value: any) => {
        setData('seat_layout', {
            ...data.seat_layout,
            [type]: value,
        });
    };

    const getEndTime = () => {
        if (!selectedFilm || !selectedDate || !data.start_time_hour || !data.start_time_minute) {
            return 'N/A';
        }

        const startTime = new Date(`${selectedDate}T${data.start_time_hour}:${data.start_time_minute}:00`);
        const endTime = new Date(startTime.getTime() + selectedFilm.duration * 60 * 1000);

        return endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <AdminLayout title="Add New Screening" subtitle="Schedule a new film screening">
            <Head title="Add New Screening" />

            {/* Header with back button */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <CalendarIcon className="w-6 h-6 mr-2 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Create Screening</h2>
                </div>
                <Link
                    href={route('admin.screenings.index')}
                    className="flex items-center px-4 py-2 text-sm font-medium transition border rounded-md border-border text-foreground hover:bg-muted"
                >
                    Back to Screenings
                </Link>
            </div>

            {/* Main form */}
            <div className="border rounded-lg shadow-sm border-border bg-card">
                <div className="p-4 border-b border-border">
                    <h3 className="font-medium text-foreground">Screening Information</h3>
                    <p className="text-sm text-muted-foreground">Schedule a new screening for your cinema</p>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Film Selection */}
                        <div className="space-y-6">
                            <div className="p-4 border rounded-lg border-border bg-muted/30">
                                <h3 className="mb-4 text-sm font-medium text-foreground">Film Selection</h3>
                                <div>
                                    <label htmlFor="film_id" className="text-foreground mb-1.5 block text-sm font-medium">
                                        Select Film <span className="text-destructive">*</span>
                                    </label>
                                    <select
                                        id="film_id"
                                        value={data.film_id}
                                        onChange={(e) => setData('film_id', e.target.value)}
                                        className={`focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 ${
                                            errors.film_id ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                        }`}
                                        required
                                    >
                                        <option value="">Select a film</option>
                                        {films.map((film) => (
                                            <option key={film.id} value={film.id}>
                                                {film.title} ({film.duration} min)
                                            </option>
                                        ))}
                                    </select>
                                    {errors.film_id && <p className="text-destructive mt-1.5 text-sm">{errors.film_id}</p>}
                                </div>

                                {selectedFilm && (
                                    <div className="p-3 mt-4 border rounded-md border-border">
                                        <div className="flex items-center">
                                            <FilmIcon className="w-5 h-5 mr-2 text-primary" />
                                            <span className="font-medium text-foreground">{selectedFilm.title}</span>
                                        </div>
                                        <div className="flex items-center mt-2 text-muted-foreground">
                                            <ClockIcon className="w-4 h-4 mr-1" />
                                            <span className="text-sm">Duration: {selectedFilm.duration} minutes</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Time and Location */}
                            <div className="p-4 border rounded-lg border-border bg-muted/30">
                                <h3 className="mb-4 text-sm font-medium text-foreground">Time and Location</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="screening_date" className="text-foreground mb-1.5 block text-sm font-medium">
                                            Screening Date <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            id="screening_date"
                                            type="date"
                                            value={selectedDate}
                                            onChange={handleDateChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            className={`focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 ${
                                                errors.start_time ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                            }`}
                                            required
                                        />
                                        {errors.start_time && <p className="text-destructive mt-1.5 text-sm">{errors.start_time}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="screening_time" className="text-foreground mb-1.5 block text-sm font-medium">
                                            Start Time <span className="text-destructive">*</span>
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <select
                                                value={data.start_time_hour}
                                                onChange={(e) => handleTimeChange('hour', e.target.value)}
                                                className="px-3 py-2 border rounded-md focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground"
                                                required
                                            >
                                                {generateTimeOptions('hour')}
                                            </select>
                                            <span className="text-foreground">:</span>
                                            <select
                                                value={data.start_time_minute}
                                                onChange={(e) => handleTimeChange('minute', e.target.value)}
                                                className="px-3 py-2 border rounded-md focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground"
                                                required
                                            >
                                                {generateTimeOptions('minute')}
                                            </select>
                                        </div>
                                    </div>

                                    {selectedFilm && selectedDate && (
                                        <div className="col-span-2 p-3 border rounded-md bg-primary/5 text-primary border-primary/20">
                                            <p className="text-sm">
                                                <span className="font-medium">End Time:</span> {getEndTime()}
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="room" className="text-foreground mb-1.5 block text-sm font-medium">
                                            Room/Theater <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            id="room"
                                            value={data.room}
                                            onChange={(e) => setData('room', e.target.value)}
                                            placeholder="e.g. Theater 1, IMAX, Screen A"
                                            className={`focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 ${
                                                errors.room ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                            }`}
                                            required
                                        />
                                        {errors.room && <p className="text-destructive mt-1.5 text-sm">{errors.room}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="price" className="text-foreground mb-1.5 block text-sm font-medium">
                                            Ticket Price <span className="text-destructive">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute -translate-y-1/2 text-muted-foreground top-1/2 left-3">$</span>
                                            <input
                                                id="price"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={data.price}
                                                onChange={(e) => setData('price', e.target.value)}
                                                placeholder="0.00"
                                                className={`focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border py-2 pr-3 pl-8 ${
                                                    errors.price ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                                }`}
                                                required
                                            />
                                        </div>
                                        {errors.price && <p className="text-destructive mt-1.5 text-sm">{errors.price}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Seats Configuration */}
                            <div className="p-4 border rounded-lg border-border bg-muted/30">
                                <div className="flex items-center justify-between">
                                    <h3 className="mb-4 text-sm font-medium text-foreground">Seats Configuration</h3>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="w-4 h-4 rounded text-primary focus:ring-primary/30 border-input"
                                        />
                                        <label htmlFor="is_active" className="ml-2 text-sm text-foreground">
                                            Active (visible to customers)
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="total_seats" className="text-foreground mb-1.5 block text-sm font-medium">
                                            Total Seats <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            id="total_seats"
                                            type="number"
                                            min="1"
                                            max="500"
                                            value={data.total_seats}
                                            onChange={(e) => setData('total_seats', e.target.value)}
                                            className={`focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 ${
                                                errors.total_seats ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                            }`}
                                            required
                                        />
                                        {errors.total_seats && <p className="text-destructive mt-1.5 text-sm">{errors.total_seats}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="seats_per_row" className="text-foreground mb-1.5 block text-sm font-medium">
                                            Seats Per Row <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            id="seats_per_row"
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={data.seat_layout.seats_per_row}
                                            onChange={(e) => updateSeatLayout('seats_per_row', parseInt(e.target.value))}
                                            className={`focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 ${
                                                errors['seat_layout.seats_per_row']
                                                    ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                                                    : ''
                                            }`}
                                            required
                                        />
                                        {errors['seat_layout.seats_per_row'] && (
                                            <p className="text-destructive mt-1.5 text-sm">{errors['seat_layout.seats_per_row']}</p>
                                        )}
                                    </div>

                                    <div className="col-span-1 md:col-span-2">
                                        <label className="text-foreground mb-1.5 block text-sm font-medium">
                                            Row Labels <span className="text-destructive">*</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2 p-3 border rounded-md border-border bg-background">
                                            {data.seat_layout.rows.map((row, index) => (
                                                <div key={index} className="flex items-center justify-center w-8 h-8 rounded bg-muted">
                                                    <span className="text-sm font-medium text-foreground">{row}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Default row configuration (A-H). Row setup can be customized by an administrator if needed.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3 mt-4 border rounded-md border-border bg-primary/5">
                                    <p className="text-sm text-primary">
                                        Total capacity: {data.seat_layout.rows.length * data.seat_layout.seats_per_row} seats (
                                        {data.seat_layout.rows.length} rows × {data.seat_layout.seats_per_row} seats per row)
                                    </p>
                                </div>
                            </div>
                        </div>


                        <div className="flex items-center justify-end space-x-3">
                            <Link
                                href={route('admin.screenings.index')}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium border rounded-md border-border text-foreground hover:bg-muted focus:ring-2 focus:outline-none disabled:opacity-70"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 text-sm font-medium transition rounded-md bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-primary/30 focus:ring-2 focus:outline-none disabled:opacity-70"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <svg className="w-4 h-4 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Creating...
                                    </>
                                ) : (
                                    'Create Screening'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
