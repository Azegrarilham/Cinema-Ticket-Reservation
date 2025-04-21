import Pagination from '@/components/Pagination';
import AdminLayout from '@/layouts/AdminLayout';
import { EyeIcon, FilmIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

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

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    films: {
        data: Film[];
        links: PaginationLink[];
        total: number;
        current_page: number;
        last_page: number;
    };
    filters: {
        search: string;
    };
}

export default function Index({ films, filters }: Props) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [filmToDelete, setFilmToDelete] = useState<Film | null>(null);

    const {
        data,
        setData,
        get,
        processing,
        delete: destroy,
    } = useForm({
        search: filters.search || '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('admin.films.index'), {
            preserveState: true,
        });
    };

    const openDeleteModal = (film: Film) => {
        setFilmToDelete(film);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setFilmToDelete(null);
    };

    const confirmDelete = () => {
        if (filmToDelete) {
            destroy(route('admin.films.destroy', { film: filmToDelete.id }), {
                onSuccess: closeDeleteModal,
            });
        }
    };

    return (
        <AdminLayout title="Films Management" subtitle="Manage your cinema's film catalog">
            <Head title="Films Management" />

            {/* Actions header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                    <FilmIcon className="text-primary mr-2 h-6 w-6" />
                    <h2 className="text-foreground text-lg font-semibold">Film Catalog</h2>
                    <span className="bg-muted ml-3 rounded-md px-2 py-1 text-xs font-medium">{films.total} total</span>
                </div>
                <Link
                    href={route('admin.films.create')}
                    className="bg-primary hover:bg-primary/90 focus:ring-primary/30 flex items-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition focus:ring-2 focus:outline-none"
                >
                    Add New Film
                </Link>
            </div>

            {/* Search Form */}
            <div className="mb-6">
                <form onSubmit={handleSearch} className="flex items-center">
                    <div className="relative flex-grow">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon className="text-muted-foreground h-5 w-5" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            name="search"
                            id="search"
                            className="focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground block w-full rounded-l-md border py-2 pr-3 pl-10 sm:text-sm"
                            placeholder="Search film titles, directors, genres... outline-none focus:outline-none"
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="focus:ring-primary/30 bg-primary hover:bg-primary/90 border-border inline-flex items-center rounded-r-md border border-l-0 px-4 py-2 text-sm font-medium text-white transition focus:ring-2 focus:outline-none disabled:opacity-50"
                        disabled={processing}
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Films Table */}
            <div className="overflow-hidden rounded-lg shadow">
                <div className="border-border bg-card relative overflow-x-auto border">
                    <table className="divide-border min-w-full divide-y">
                        <thead className="bg-muted">
                            <tr>
                                <th scope="col" className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                                    Title
                                </th>
                                <th scope="col" className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                                    Genre
                                </th>
                                <th scope="col" className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                                    Duration
                                </th>
                                <th scope="col" className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                                    Release Date
                                </th>
                                <th scope="col" className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                                    Screenings
                                </th>
                                <th scope="col" className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                                    Featured
                                </th>
                                <th scope="col" className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-border bg-card divide-y">
                            {films.data.length > 0 ? (
                                films.data.map((film) => (
                                    <tr key={film.id} className="hover:bg-muted/40 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="border-border h-12 w-9 flex-shrink-0 overflow-hidden rounded-md border shadow-sm">
                                                    <img
                                                        className="h-full w-full object-cover"
                                                        src={
                                                            film.poster_image
                                                                ? film.poster_image.startsWith('http')
                                                                    ? film.poster_image
                                                                    : `/storage/${film.poster_image}`
                                                                : '/images/placeholder.png'
                                                        }
                                                        alt={film.title}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-foreground text-sm font-medium">{film.title}</div>
                                                    <div className="text-muted-foreground text-xs">Dir: {film.director}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap">
                                            <span className="bg-primary/10 text-primary inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium">
                                                {film.genre}
                                            </span>
                                        </td>
                                        <td className="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap">{film.duration} min</td>
                                        <td className="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap">
                                            {new Date(film.release_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="flex items-center">
                                                    <div className="bg-success mr-2 h-2 w-2 rounded-full"></div>
                                                    <span className="text-muted-foreground text-xs">Total: {film.screenings_count}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="bg-primary mr-2 h-2 w-2 rounded-full"></div>
                                                    <span className="text-muted-foreground text-xs">Upcoming: {film.future_screenings_count}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                                                    film.is_featured ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                {film.is_featured ? 'Featured' : 'Standard'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <Link
                                                    href={route('admin.films.show', { film: film.id })}
                                                    className="text-primary hover:text-primary/80 transition"
                                                    title="View"
                                                    aria-label={`View details for ${film.title}`}
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </Link>
                                                <Link
                                                    href={route('admin.films.edit', { film: film.id })}
                                                    className="text-warning hover:text-warning/80 transition"
                                                    title="Edit"
                                                    aria-label={`Edit ${film.title}`}
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => openDeleteModal(film)}
                                                    className="text-destructive hover:text-destructive/80 transition"
                                                    title="Delete"
                                                    aria-label={`Delete ${film.title}`}
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <FilmIcon className="text-muted-foreground mb-4 h-12 w-12" />
                                            <p className="text-muted-foreground mb-4 text-sm">No films found matching your search criteria.</p>
                                            {data.search && (
                                                <button
                                                    onClick={() => {
                                                        setData('search', '');
                                                        get(route('admin.films.index'), { preserveState: true });
                                                    }}
                                                    className="bg-primary hover:bg-primary/90 focus:ring-primary/30 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white transition focus:ring-2 focus:outline-none"
                                                >
                                                    Clear Search
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {films.data.length > 0 && (
                <div className="mt-6">
                    <Pagination links={films.links} />
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && filmToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-card w-full max-w-md rounded-lg p-6 shadow-lg">
                        <div className="mb-4 flex items-center">
                            <div className="bg-destructive/10 text-destructive flex h-10 w-10 items-center justify-center rounded-full">
                                <TrashIcon className="h-5 w-5" />
                            </div>
                            <h3 className="text-foreground ml-3 text-lg font-medium">Delete Film</h3>
                        </div>

                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to delete <span className="font-semibold">{filmToDelete.title}</span>? This action cannot be undone,
                            and will also delete all associated screenings and reservations.
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeDeleteModal}
                                className="border-border text-foreground hover:bg-muted rounded-md border px-4 py-2 text-sm font-medium focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md px-4 py-2 text-sm font-medium focus:outline-none"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
