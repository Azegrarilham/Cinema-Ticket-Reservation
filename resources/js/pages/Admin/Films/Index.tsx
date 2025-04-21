import { Pagination } from '@/components/ui/pagination';
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
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <FilmIcon className="w-6 h-6 mr-2 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Film Catalog</h2>
                    <span className="px-2 py-1 ml-3 text-xs font-medium rounded-md bg-muted">{films.total} total</span>
                </div>
                <Link
                    href={route('admin.films.create')}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white transition rounded-md shadow-sm bg-primary hover:bg-primary/90 focus:ring-primary/30 focus:ring-2 focus:outline-none"
                >
                    Add New Film
                </Link>
            </div>

            {/* Search Form */}
            <div className="mb-6">
                <form onSubmit={handleSearch} className="flex items-center">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MagnifyingGlassIcon className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            name="search"
                            id="search"
                            className="block w-full py-2 pl-10 pr-3 border focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground rounded-l-md sm:text-sm"
                            placeholder="Search film titles, directors, genres... outline-none focus:outline-none"
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition border border-l-0 focus:ring-primary/30 bg-primary hover:bg-primary/90 border-border rounded-r-md focus:ring-2 focus:outline-none disabled:opacity-50"
                        disabled={processing}
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Films Table */}
            <div className="overflow-hidden rounded-lg shadow">
                <div className="relative overflow-x-auto border border-border bg-card">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Title
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Genre
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Duration
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Release Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Screenings
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Featured
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                            {films.data.length > 0 ? (
                                films.data.map((film) => (
                                    <tr key={film.id} className="transition-colors hover:bg-muted/40">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-12 overflow-hidden border rounded-md shadow-sm border-border w-9">
                                                    <img
                                                        className="object-cover w-full h-full"
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
                                                    <div className="text-sm font-medium text-foreground">{film.title}</div>
                                                    <div className="text-xs text-muted-foreground">Dir: {film.director}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                                            <span className="bg-primary/10 text-primary inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium">
                                                {film.genre}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">{film.duration} min</td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                                            {new Date(film.release_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 mr-2 rounded-full bg-success"></div>
                                                    <span className="text-xs text-muted-foreground">Total: {film.screenings_count}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 mr-2 rounded-full bg-primary"></div>
                                                    <span className="text-xs text-muted-foreground">Upcoming: {film.future_screenings_count}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${film.is_featured ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                                                    }`}
                                            >
                                                {film.is_featured ? 'Featured' : 'Standard'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <Link
                                                    href={route('admin.films.show', { film: film.id })}
                                                    className="transition text-primary hover:text-primary/80"
                                                    title="View"
                                                    aria-label={`View details for ${film.title}`}
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                </Link>
                                                <Link
                                                    href={route('admin.films.edit', { film: film.id })}
                                                    className="transition text-warning hover:text-warning/80"
                                                    title="Edit"
                                                    aria-label={`Edit ${film.title}`}
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => openDeleteModal(film)}
                                                    className="transition text-destructive hover:text-destructive/80"
                                                    title="Delete"
                                                    aria-label={`Delete ${film.title}`}
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <FilmIcon className="w-12 h-12 mb-4 text-muted-foreground" />
                                            <p className="mb-4 text-sm text-muted-foreground">No films found matching your search criteria.</p>
                                            {data.search && (
                                                <button
                                                    onClick={() => {
                                                        setData('search', '');
                                                        get(route('admin.films.index'), { preserveState: true });
                                                    }}
                                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition rounded-md bg-primary hover:bg-primary/90 focus:ring-primary/30 focus:ring-2 focus:outline-none"
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
                    <Pagination links={films.links} currentPage={films.current_page} totalPages={films.last_page} />
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && filmToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-card">
                        <div className="flex items-center mb-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10 text-destructive">
                                <TrashIcon className="w-5 h-5" />
                            </div>
                            <h3 className="ml-3 text-lg font-medium text-foreground">Delete Film</h3>
                        </div>

                        <p className="mb-6 text-muted-foreground">
                            Are you sure you want to delete <span className="font-semibold">{filmToDelete.title}</span>? This action cannot be undone,
                            and will also delete all associated screenings and reservations.
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeDeleteModal}
                                className="px-4 py-2 text-sm font-medium border rounded-md border-border text-foreground hover:bg-muted focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-medium rounded-md bg-destructive hover:bg-destructive/90 text-destructive-foreground focus:outline-none"
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
