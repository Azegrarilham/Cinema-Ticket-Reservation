import { Pagination } from '@/components/ui/pagination';
import DeletePopup from '@/components/ui/DeletePopup';
import AdminLayout from '@/layouts/AdminLayout';
import { EyeIcon, FilmIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
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

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24
        }
    }
};

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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setData('search', value);

        const timeoutId = setTimeout(() => {
            get(route('admin.films.index'), {
                preserveState: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timeoutId);
    };

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
            <motion.div
                className="flex items-center justify-between mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-center">
                    <motion.div
                        whileHover={{ rotate: 10 }}
                        className="flex items-center justify-center w-10 h-10 mr-2 rounded-lg bg-primary/10"
                    >
                        <FilmIcon className="w-6 h-6 text-primary" />
                    </motion.div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Film Catalog</h2>
                        <span className="px-2 py-1 ml-1 text-xs font-medium rounded-md bg-muted">{films.total} total</span>
                    </div>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                        href={route('admin.films.create')}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white transition rounded-md shadow-sm bg-primary hover:bg-primary/90 focus:ring-primary/30 focus:ring-2 focus:outline-none"
                    >
                        Add New Film
                    </Link>
                </motion.div>
            </motion.div>

            {/* Search Form */}
            <motion.div
                className="mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
            >
                <form onSubmit={handleSearch} className="flex items-center">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MagnifyingGlassIcon className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                        </div>
                        <motion.input
                            whileFocus={{ scale: 1.01 }}
                            transition={{ duration: 0.2 }}
                            type="text"
                            name="search"
                            id="search"
                            className="block w-full py-2 pl-10 pr-3 border rounded-md shadow-sm focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input placeholder:text-muted-foreground sm:text-sm"
                            placeholder="Search film titles, directors, genres..."
                            value={data.search}
                            onChange={handleSearchChange}
                        />
                    </div>
                </form>
            </motion.div>

            {/* Films Table */}
            <motion.div
                className="overflow-hidden transition-shadow rounded-lg shadow-md hover:shadow-lg"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
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
                                films.data.map((film, index) => (
                                    <motion.tr
                                        key={film.id}
                                        className="transition-colors hover:bg-muted/40"
                                        variants={itemVariants}
                                        custom={index}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 w-10 overflow-hidden border rounded-md shadow-sm h-14 border-border">
                                                    <motion.img
                                                        whileHover={{ scale: 1.15 }}
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
                                            <div className="flex space-x-3">
                                                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                                    <Link
                                                        href={route('admin.films.show', { film: film.id })}
                                                        className="transition text-primary hover:text-primary/80"
                                                        title="View"
                                                        aria-label={`View details for ${film.title}`}
                                                    >
                                                        <EyeIcon className="w-5 h-5" />
                                                    </Link>
                                                </motion.div>
                                                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                                    <Link
                                                        href={route('admin.films.edit', { film: film.id })}
                                                        className="transition text-warning hover:text-warning/80"
                                                        title="Edit"
                                                        aria-label={`Edit ${film.title}`}
                                                    >
                                                        <PencilIcon className="w-5 h-5" />
                                                    </Link>
                                                </motion.div>
                                                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                                    <button
                                                        onClick={() => openDeleteModal(film)}
                                                        className="transition text-destructive hover:text-destructive/80"
                                                        title="Delete"
                                                        aria-label={`Delete ${film.title}`}
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </motion.div>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <FilmIcon className="w-12 h-12 mb-3 text-muted-foreground" />
                                            <h3 className="mb-1 text-lg font-medium text-foreground">No films found</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {data.search
                                                    ? 'Try changing your search query'
                                                    : 'Get started by adding your first film'}
                                            </p>
                                            {!data.search && (
                                                <motion.div
                                                    className="mt-4"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Link
                                                        href={route('admin.films.create')}
                                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition rounded-md shadow-sm bg-primary hover:bg-primary/90 focus:ring-primary/30 focus:ring-2 focus:outline-none"
                                                    >
                                                        Add New Film
                                                    </Link>
                                                </motion.div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Pagination */}
            {films.data.length > 0 && (
                <motion.div
                    className="flex items-center justify-between mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <div className="flex items-center text-sm text-muted-foreground">
                        Showing <span className="mx-1 font-medium">{(films.current_page - 1) * 15 + 1}</span>
                        to <span className="mx-1 font-medium">{Math.min(films.current_page * 15, films.total)}</span>
                        of <span className="mx-1 font-medium">{films.total}</span> films
                    </div>
                    <Pagination
                        links={films.links}
                        currentPage={films.current_page}
                        totalPages={films.last_page}
                    />
                </motion.div>
            )}

            {/* Delete Confirmation Modal */}
            <DeletePopup
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onDelete={confirmDelete}
                title="Delete Film"
                itemName={filmToDelete?.title}
                description="Are you sure you want to delete {itemName}? This action cannot be undone and will remove all screenings and reservations associated with this film."
                processing={processing}
            />
        </AdminLayout>
    );
}
