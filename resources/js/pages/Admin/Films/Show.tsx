import AdminLayout from '@/layouts/AdminLayout';
import { CalendarIcon, ClockIcon, FilmIcon, PencilIcon, UserIcon } from '@heroicons/react/24/outline';
import { Head, Link } from '@inertiajs/react';

interface Film {
    id: number;
    title: string;
    description: string;
    duration: number;
    poster_image: string;
    genre: string;
    release_date: string;
    director: string;
    is_featured: boolean;
    screenings_count: number;
    future_screenings_count: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    film: Film;
}

export default function Show({ film }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AdminLayout title={film.title} subtitle="Film Details">
            <Head title={`Film: ${film.title}`} />

            {/* Header with back and edit buttons */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                    <FilmIcon className="text-primary mr-2 h-6 w-6" />
                    <h2 className="text-foreground text-lg font-semibold">Film Details</h2>
                </div>
                <div className="flex space-x-3">
                    <Link
                        href={route('admin.films.index')}
                        className="border-border text-foreground hover:bg-muted flex items-center rounded-md border px-4 py-2 text-sm font-medium transition"
                    >
                        Back to Films
                    </Link>
                    <Link
                        href={route('admin.films.edit', { film: film.id })}
                        className="bg-warning hover:bg-warning/90 text-warning-foreground flex items-center rounded-md px-4 py-2 text-sm font-medium transition"
                    >
                        <PencilIcon className="mr-2 h-4 w-4" />
                        Edit Film
                    </Link>
                </div>
            </div>

            {/* Film details */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Poster and basic info */}
                <div className="border-border bg-card col-span-1 rounded-lg border shadow-sm">
                    <div className="p-6">
                        <div className="mb-4 flex flex-col items-center space-y-4">
                            <div className="border-border h-auto w-full max-w-[250px] overflow-hidden rounded-lg border shadow-md">
                                <img
                                    src={
                                        film.poster_image
                                            ? film.poster_image.startsWith('http')
                                                ? film.poster_image
                                                : `/storage/${film.poster_image}`
                                            : '/images/placeholder.png'
                                    }
                                    alt={film.title}
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            {film.is_featured && (
                                <span className="bg-success/20 text-success inline-flex rounded-full px-3 py-1 text-sm font-medium">
                                    Featured Film
                                </span>
                            )}
                        </div>

                        <div className="border-border border-t pt-4">
                            <h3 className="text-foreground mb-4 text-lg font-medium">Quick Info</h3>
                            <ul className="space-y-3">
                                <li className="flex items-center">
                                    <UserIcon className="text-muted-foreground mr-2 h-4 w-4" />
                                    <span className="text-muted-foreground text-sm">Director: </span>
                                    <span className="text-foreground ml-1 text-sm font-medium">{film.director}</span>
                                </li>
                                <li className="flex items-center">
                                    <CalendarIcon className="text-muted-foreground mr-2 h-4 w-4" />
                                    <span className="text-muted-foreground text-sm">Released: </span>
                                    <span className="text-foreground ml-1 text-sm font-medium">{formatDate(film.release_date)}</span>
                                </li>
                                <li className="flex items-center">
                                    <ClockIcon className="text-muted-foreground mr-2 h-4 w-4" />
                                    <span className="text-muted-foreground text-sm">Duration: </span>
                                    <span className="text-foreground ml-1 text-sm font-medium">{film.duration} minutes</span>
                                </li>
                                <li className="flex items-center">
                                    <FilmIcon className="text-muted-foreground mr-2 h-4 w-4" />
                                    <span className="text-muted-foreground text-sm">Genre: </span>
                                    <span className="text-foreground ml-1 text-sm font-medium">{film.genre}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Details and screenings */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Description */}
                    <div className="border-border bg-card rounded-lg border shadow-sm">
                        <div className="border-border border-b p-4">
                            <h3 className="text-foreground font-medium">Description</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-foreground text-sm leading-relaxed whitespace-pre-line">{film.description}</p>
                        </div>
                    </div>

                    {/* Screenings stats */}
                    <div className="border-border bg-card rounded-lg border shadow-sm">
                        <div className="border-border border-b p-4">
                            <h3 className="text-foreground font-medium">Screenings Information</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="border-border bg-muted/30 rounded-lg border p-4">
                                    <div className="text-muted-foreground mb-1 text-sm">Total Screenings</div>
                                    <div className="text-foreground text-2xl font-bold">{film.screenings_count}</div>
                                </div>
                                <div className="border-border bg-primary/10 rounded-lg border p-4">
                                    <div className="text-muted-foreground mb-1 text-sm">Upcoming Screenings</div>
                                    <div className="text-primary text-2xl font-bold">{film.future_screenings_count}</div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <Link
                                    href={route('admin.screenings.index', { film_id: film.id })}
                                    className="text-primary hover:text-primary/90 inline-flex items-center text-sm"
                                >
                                    <CalendarIcon className="mr-1 h-4 w-4" />
                                    View all screenings for this film
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="border-border bg-card rounded-lg border shadow-sm">
                        <div className="border-border border-b p-4">
                            <h3 className="text-foreground font-medium">Metadata</h3>
                        </div>
                        <div className="divide-border divide-y">
                            <div className="grid grid-cols-2 p-4">
                                <div className="text-muted-foreground text-sm">Created</div>
                                <div className="text-foreground text-sm">{formatDate(film.created_at)}</div>
                            </div>
                            <div className="grid grid-cols-2 p-4">
                                <div className="text-muted-foreground text-sm">Last Updated</div>
                                <div className="text-foreground text-sm">{formatDate(film.updated_at)}</div>
                            </div>
                            <div className="grid grid-cols-2 p-4">
                                <div className="text-muted-foreground text-sm">Film ID</div>
                                <div className="text-foreground text-sm">{film.id}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
