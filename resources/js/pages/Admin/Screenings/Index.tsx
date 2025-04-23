import { Pagination } from '@/components/ui/pagination';
import DeletePopup from '@/components/ui/DeletePopup';
import AdminLayout from '@/layouts/AdminLayout';
import { CalendarIcon, ClockIcon, EyeIcon, FilmIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import React, { useState } from 'react';

interface Screening {
    id: number;
    start_time: string;
    end_time: string;
    price: number;
    room: string;
    is_published: boolean;
    is_full: boolean;
    available_seats_count: number;
    reserved_seats_count: number;
    total_seats_count: number;
    film: {
        id: number;
        title: string;
        duration: number;
        poster_image: string;
    };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    screenings: {
        data: Screening[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search: string;
        status: string;
        date_range: string;
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

export default function Index({ screenings, filters }: Props) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [screeningToDelete, setScreeningToDelete] = useState<Screening | null>(null);

    const {
        data,
        setData,
        get,
        processing,
        delete: destroy,
    } = useForm({
        search: filters.search || '',
        status: filters.status || 'all',
        date_range: filters.date_range || 'all',
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setData('search', value);

        const timeoutId = setTimeout(() => {
            get(route('admin.screenings.index'), {
                preserveState: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timeoutId);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setData(name as 'search' | 'status' | 'date_range', value);
        get(route('admin.screenings.index'), {
            preserveState: true,
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('admin.screenings.index'), {
            preserveState: true,
        });
    };

    const openDeleteModal = (screening: Screening) => {
        setScreeningToDelete(screening);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setScreeningToDelete(null);
    };

    const confirmDelete = () => {
        if (screeningToDelete) {
            destroy(route('admin.screenings.destroy', { screening: screeningToDelete.id }), {
                onSuccess: closeDeleteModal,
            });
        }
    };

    // Format date and time helpers
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const getStatusBadgeClass = (screening: Screening) => {
        if (!screening.is_published) {
            return 'bg-muted text-muted-foreground';
        }

        const now = new Date();
        const screeningTime = new Date(screening.start_time);

        if (screeningTime < now) {
            return 'bg-muted text-muted-foreground';
        }

        if (screening.is_full) {
            return 'bg-destructive/20 text-destructive';
        }

        if (screening.reserved_seats_count / screening.total_seats_count > 0.7) {
            return 'bg-warning/20 text-warning';
        }

        return 'bg-success/20 text-success';
    };

    const getStatusText = (screening: Screening) => {
        if (!screening.is_published) {
            return 'Draft';
        }

        const now = new Date();
        const screeningTime = new Date(screening.start_time);

        if (screeningTime < now) {
            return 'Past';
        }

        if (screening.is_full) {
            return 'Sold Out';
        }

        if (screening.reserved_seats_count / screening.total_seats_count > 0.7) {
            return 'Filling Fast';
        }

        return 'Available';
    };

    return (
        <AdminLayout title="Screenings Management" subtitle="Manage your cinema's screening schedule">
            <Head title="Screenings Management" />

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
                        <CalendarIcon className="w-6 h-6 text-primary" />
                    </motion.div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Screening Schedule</h2>
                        <span className="px-2 py-1 ml-1 text-xs font-medium rounded-md bg-muted">{screenings.total} total</span>
                    </div>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                        href={route('admin.screenings.create')}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white transition rounded-md shadow-sm bg-primary hover:bg-primary/90 focus:ring-primary/30 focus:ring-2 focus:outline-none"
                    >
                        Add New Screening
                    </Link>
                </motion.div>
            </motion.div>

            {/* Filters */}
            <motion.div
                className="mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
            >
                <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row md:items-end">
                    <div className="flex-1">
                        <label htmlFor="search" className="block mb-1 text-sm font-medium text-foreground">
                            Search
                        </label>
                        <div className="relative">
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
                                placeholder="Search film titles, rooms..."
                                value={data.search}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-40">
                        <label htmlFor="status" className="block mb-1 text-sm font-medium text-foreground">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={data.status}
                            onChange={handleFilterChange}
                            className="block w-full py-2 pl-3 pr-10 border rounded-md shadow-sm focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input sm:text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="past">Past</option>
                        </select>
                    </div>

                    <div className="w-full md:w-40">
                        <label htmlFor="date_range" className="block mb-1 text-sm font-medium text-foreground">
                            Time Frame
                        </label>
                        <select
                            id="date_range"
                            name="date_range"
                            value={data.date_range}
                            onChange={handleFilterChange}
                            className="block w-full py-2 pl-3 pr-10 border rounded-md shadow-sm focus:border-primary focus:ring-primary/30 bg-background text-foreground border-input sm:text-sm"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                </form>
            </motion.div>

            {/* Screenings Table */}
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
                                    Film
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Date & Time
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Room
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Price
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Seats
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                            {screenings.data.length > 0 ? (
                                screenings.data.map((screening, index) => (
                                    <motion.tr
                                        key={screening.id}
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
                                                            screening.film.poster_image
                                                                ? screening.film.poster_image.startsWith('http')
                                                                    ? screening.film.poster_image
                                                                    : `/storage/${screening.film.poster_image}`
                                                                : '/images/placeholder.png'
                                                        }
                                                        alt={screening.film.title}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-foreground">{screening.film.title}</div>
                                                    <div className="text-xs text-muted-foreground">{screening.film.duration} minutes</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-foreground">{formatDate(screening.start_time)}</div>
                                            <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                                <ClockIcon className="w-3 h-3 mr-1" />
                                                {formatTime(screening.start_time)} - {formatTime(screening.end_time)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                                            <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                                                {screening.room}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                                            {formatCurrency(screening.price)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-16 h-2 mr-2 overflow-hidden rounded-full bg-muted">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(screening.reserved_seats_count / screening.total_seats_count) * 100}%` }}
                                                        transition={{ duration: 0.8, delay: index * 0.1 }}
                                                        className={`h-full ${screening.is_full ? 'bg-destructive' : 'bg-primary'}`}
                                                    />
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {screening.reserved_seats_count}/{screening.total_seats_count}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(screening)}`}
                                            >
                                                {getStatusText(screening)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                            <div className="flex space-x-3">
                                                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                                    <Link
                                                        href={route('admin.screenings.show', { screening: screening.id })}
                                                        className="transition text-primary hover:text-primary/80"
                                                        title="View"
                                                        aria-label={`View details for ${screening.film.title} on ${formatDate(screening.start_time)}`}
                                                    >
                                                        <EyeIcon className="w-5 h-5" />
                                                    </Link>
                                                </motion.div>
                                                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                                    <Link
                                                        href={route('admin.screenings.edit', { screening: screening.id })}
                                                        className="transition text-warning hover:text-warning/80"
                                                        title="Edit"
                                                        aria-label={`Edit ${screening.film.title} on ${formatDate(screening.start_time)}`}
                                                    >
                                                        <PencilIcon className="w-5 h-5" />
                                                    </Link>
                                                </motion.div>
                                                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                                    <button
                                                        onClick={() => openDeleteModal(screening)}
                                                        className="transition text-destructive hover:text-destructive/80"
                                                        title="Delete"
                                                        aria-label={`Delete ${screening.film.title} on ${formatDate(screening.start_time)}`}
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
                                            <CalendarIcon className="w-12 h-12 mb-3 text-muted-foreground" />
                                            <h3 className="mb-1 text-lg font-medium text-foreground">No screenings found</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {data.search || data.status !== 'all' || data.date_range !== 'all'
                                                    ? 'Try changing your search criteria'
                                                    : 'Get started by scheduling a screening'}
                                            </p>
                                            {!data.search && data.status === 'all' && data.date_range === 'all' && (
                                                <motion.div
                                                    className="mt-4"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Link
                                                        href={route('admin.screenings.create')}
                                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition rounded-md shadow-sm bg-primary hover:bg-primary/90 focus:ring-primary/30 focus:ring-2 focus:outline-none"
                                                    >
                                                        Schedule New Screening
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
            {screenings.data.length > 0 && (
                <motion.div
                    className="flex items-center justify-between mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <div className="flex items-center text-sm text-muted-foreground">
                        Showing <span className="mx-1 font-medium">{(screenings.current_page - 1) * 15 + 1}</span>
                        to <span className="mx-1 font-medium">{Math.min(screenings.current_page * 15, screenings.total)}</span>
                        of <span className="mx-1 font-medium">{screenings.total}</span> screenings
                    </div>
                    <Pagination
                        links={screenings.links}
                        currentPage={screenings.current_page}
                        totalPages={screenings.last_page}
                    />
                </motion.div>
            )}

            {/* Delete Confirmation Modal */}
            <DeletePopup
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onDelete={confirmDelete}
                title="Delete Screening"
                itemName={screeningToDelete?.film.title}
                description={screeningToDelete ?
                    `Are you sure you want to delete the screening of {itemName} on ${formatDate(screeningToDelete.start_time)} at ${formatTime(screeningToDelete.start_time)}? This action cannot be undone and will cancel all associated reservations.` :
                    "Are you sure you want to delete this screening? This action cannot be undone."
                }
                processing={processing}
            />
        </AdminLayout>
    );
}
