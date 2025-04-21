import AdminLayout from '@/layouts/AdminLayout';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';

interface Film {
    id: number;
    title: string;
    duration: number;
}

interface Screening {
    id: number;
    film_id: number;
    start_time: string;
    room: string;
    price: number;
    total_seats: number;
    is_active: boolean;
}

interface Props {
    screening: Screening;
    films: Film[];
}

export default function Edit({ screening, films }: Props) {
    const { data, setData, errors, put, processing } = useForm({
        film_id: screening.film_id.toString(),
        start_time: formatDateTimeLocal(screening.start_time),
        room: screening.room,
        price: screening.price.toString(),
        is_active: screening.is_active,
    });

    // Format date for datetime-local input
    function formatDateTimeLocal(dateString: string): string {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.screenings.update', { screening: screening.id }));
    };

    return (
        <AdminLayout title="Edit Screening" subtitle="Modify screening details">
            <Head title="Edit Screening" />

            {/* Header with back button */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                    <CalendarIcon className="text-primary mr-2 h-6 w-6" />
                    <h2 className="text-foreground text-lg font-semibold">Edit Screening</h2>
                </div>
                <Link
                    href={route('admin.screenings.show', { screening: screening.id })}
                    className="border-border text-foreground hover:bg-muted flex items-center rounded-md border px-4 py-2 text-sm font-medium transition"
                >
                    Back to Screening Details
                </Link>
            </div>

            {/* Main form */}
            <div className="border-border bg-card rounded-lg border shadow-sm">
                <div className="border-border border-b p-4">
                    <h3 className="text-foreground font-medium">Screening Information</h3>
                    <p className="text-muted-foreground text-sm">Update this screening's details</p>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Film Selection */}
                        <div className="space-y-6">
                            <div className="border-border bg-muted/30 rounded-lg border p-4">
                                <h3 className="text-foreground mb-4 text-sm font-medium">Film Selection</h3>
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
                            </div>

                            {/* Time and Location */}
                            <div className="border-border bg-muted/30 rounded-lg border p-4">
                                <h3 className="text-foreground mb-4 text-sm font-medium">Time and Location</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="start_time" className="text-foreground mb-1.5 block text-sm font-medium">
                                            Date & Time <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            id="start_time"
                                            type="datetime-local"
                                            value={data.start_time}
                                            onChange={(e) => setData('start_time', e.target.value)}
                                            className={`focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 ${
                                                errors.start_time ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
                                            }`}
                                            required
                                        />
                                        {errors.start_time && <p className="text-destructive mt-1.5 text-sm">{errors.start_time}</p>}
                                    </div>

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
                                            <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">$</span>
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

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="text-primary focus:ring-primary/30 border-input h-4 w-4 rounded"
                                        />
                                        <label htmlFor="is_active" className="text-foreground ml-2 text-sm">
                                            Active (visible to customers)
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <p className="text-muted-foreground mb-6">
                                <strong>Note:</strong> Editing a screening will not affect existing reservations. You cannot modify the seating layout
                                after creation.
                            </p>

                            <div className="flex justify-end space-x-3">
                                <Link
                                    href={route('admin.screenings.show', { screening: screening.id })}
                                    className="border-border text-foreground hover:bg-muted inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-primary hover:bg-primary/90 focus:ring-primary/30 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition focus:ring-2 focus:outline-none disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
