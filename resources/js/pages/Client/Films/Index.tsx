import { Pagination } from '@/components/ui/pagination';
import ClientLayout from '@/layouts/ClientLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { FormEvent, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface Film {
    id: number;
    title: string;
    description: string;
    genre: string | null;
    director: string | null;
    duration: number;
    poster_image: string | null;
    release_date: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface FilmsProps {
    films: {
        data: Film[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
    };
    genres: string[];
    filters: {
        search?: string;
        genre?: string;
    };
}

export default function Index({ films, genres, filters }: FilmsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedGenre, setSelectedGenre] = useState(filters.genre || '');
    const [scrollY, setScrollY] = useState(0);

    // Animation hooks
    const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.1 });
    const [filmsRef, filmsInView] = useInView({ triggerOnce: true, threshold: 0.1 });

    // Parallax effect
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();

        router.get(
            '/films',
            {
                search,
                genre: selectedGenre,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedGenre('');

        router.get(
            '/films',
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
    };

    const cardVariants = {
        initial: { scale: 1, y: 0 },
        hover: {
            scale: 1.03,
            y: -5,
            transition: { duration: 0.3, ease: 'easeOut' },
        },
    };

    return (
        <ClientLayout>
            <Head title="Explore Films | CineVerse" />

            {/* Hero Section with Parallax */}
            <section
                className="relative overflow-hidden bg-black py-24"
                style={{
                    backgroundImage: 'url(/storage/images/cinema-pattern.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                }}
            >
                <div
                    className="absolute inset-0 z-0 bg-gradient-to-b from-black/90 via-black/80 to-black/70"
                    style={{
                        transform: `translateY(${scrollY * 0.1}px)`,
                    }}
                />

                {/* Floating cinema elements */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute top-20 right-1/4"
                        animate={{
                            y: [0, -10, 0],
                            rotate: [0, 3, 0],
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 4,
                            ease: 'easeInOut',
                        }}
                    >
                        <div className="h-16 w-16 rounded-full bg-black opacity-30 blur-md" />
                    </motion.div>
                    <motion.div
                        className="absolute bottom-40 left-1/3"
                        animate={{
                            y: [0, 8, 0],
                            rotate: [0, -2, 0],
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 6,
                            delay: 1,
                            ease: 'easeInOut',
                        }}
                    >
                        <div className="h-20 w-20 rounded-full bg-indigo-600/20 opacity-20 blur-md" />
                    </motion.div>
                </div>

                <div ref={headerRef} className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="mb-4 inline-flex items-center justify-center">
                            <span className="bg-primary/70 h-[1px] w-8"></span>
                            <span className="text-primary/80 mx-3 text-sm font-medium tracking-[0.2em] uppercase">Explore</span>
                            <span className="bg-primary/70 h-[1px] w-8"></span>
                        </div>
                        <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
                            Discover <span className="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-transparent">Cinematic</span>{' '}
                            Treasures
                        </h1>
                        <p className="mx-auto mt-6 mb-8 max-w-2xl text-lg text-gray-300/90">
                            Find your next favorite movie from our extensive collection of films from all genres
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="from-black py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Filters Section with Animation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="mb-12 rounded-xl border border-gray-800/50 bg-black/40 py-8 shadow-lg backdrop-blur-sm"
                    >
                        <div className="mb-6 border-b border-gray-700/50 px-6 pb-5">
                            <h2 className="text-2xl font-bold text-white">Filter Collection</h2>
                            <p className="mt-1 text-gray-400">Find the perfect film for your mood</p>
                        </div>

                        <form onSubmit={handleSearch} className="px-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-8">
                                <div className="space-y-2 md:col-span-4">
                                    <label htmlFor="search" className="flex items-center text-sm font-medium text-gray-300">
                                        <svg className="text-primary mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path
                                                fillRule="evenodd"
                                                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Search by Title
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="search"
                                            name="search"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Enter film title..."
                                            className="focus:ring-primary/50 block w-full rounded-lg border-0 bg-gray-800/70 py-2.5 pr-10 pl-4 text-white placeholder-gray-500 shadow-inner focus:bg-gray-800/90 focus:ring-1"
                                        />
                                        {search && (
                                            <button
                                                type="button"
                                                onClick={() => setSearch('')}
                                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                                            >
                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label htmlFor="genre" className="flex items-center text-sm font-medium text-gray-300">
                                        <svg className="text-primary mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path
                                                fillRule="evenodd"
                                                d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Genre
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="genre"
                                            name="genre"
                                            value={selectedGenre}
                                            onChange={(e) => setSelectedGenre(e.target.value)}
                                            className="focus:ring-primary/50 block w-full appearance-none rounded-lg border-0 bg-gray-800/70 py-2.5 pr-10 pl-4 text-white shadow-inner focus:bg-gray-800/90 focus:ring-1"
                                        >
                                            <option value="">All Genres</option>
                                            {genres.map((genre) => (
                                                <option key={genre} value={genre}>
                                                    {genre}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-end space-x-2 md:col-span-2">
                                    <button
                                        type="submit"
                                        className="bg-primary hover:bg-primary/90 focus:ring-primary/50 w-full rounded-lg border border-transparent px-4 py-2.5 text-sm font-medium text-white shadow-md transition-colors duration-200 focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-900 focus:outline-none"
                                    >
                                        Apply Filters
                                    </button>

                                    {(search || selectedGenre) && (
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className="flex items-center justify-center rounded-lg bg-gray-800 p-2.5 text-gray-400 transition-colors duration-200 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-gray-600"
                                            aria-label="Clear filters"
                                        >
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Applied filters */}
                            {(search || selectedGenre) && (
                                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-700/50 pt-4">
                                    <span className="text-sm text-gray-400">Applied filters:</span>
                                    {search && (
                                        <span className="inline-flex items-center rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-300">
                                            "{search}"
                                            <button type="button" onClick={() => setSearch('')} className="ml-1 text-gray-400 hover:text-white">
                                                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    )}
                                    {selectedGenre && (
                                        <span className="bg-primary/20 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                                            {selectedGenre}
                                            <button
                                                type="button"
                                                onClick={() => setSelectedGenre('')}
                                                className="text-primary/70 hover:text-primary ml-1"
                                            >
                                                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    )}
                                </div>
                            )}
                        </form>
                    </motion.div>

                    {/* Films Grid with Animations */}
                    <div ref={filmsRef}>
                        {films.data.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
                                <svg className="mx-auto h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1}
                                        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                                    />
                                </svg>
                                <p className="mt-4 text-lg text-gray-400">No films found matching your criteria.</p>
                                <button
                                    onClick={clearFilters}
                                    className="bg-primary hover:bg-primary/90 mt-6 inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-200"
                                >
                                    Clear Filters
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate={filmsInView ? 'visible' : 'hidden'}
                                className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            >
                                {films.data.map((film) => (
                                    <motion.div
                                        key={film.id}
                                        variants={itemVariants}
                                        whileHover="hover"
                                        initial="initial"
                                        className="group relative overflow-hidden rounded-xl shadow-xl"
                                    >
                                        <motion.div variants={cardVariants}>
                                            {/* Poster image with gradient overlay */}
                                            <div className="relative aspect-[2/3] overflow-hidden">
                                                {film.poster_image ? (
                                                    <>
                                                        <img
                                                            src={
                                                                film.poster_image.startsWith('http')
                                                                    ? film.poster_image
                                                                    : `/storage/${film.poster_image}`
                                                            }
                                                            alt={film.title}
                                                            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                                                        />
                                                        {/* Gradient overlay */}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
                                                    </>
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-gray-800">
                                                        <svg
                                                            className="h-16 w-16 text-gray-600"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={1}
                                                                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}

                                                {/* Content overlay - absolute positioned at bottom */}
                                                <div className="absolute right-0 bottom-0 left-0 translate-y-2 transform p-4 transition-transform duration-300 group-hover:translate-y-0">
                                                    {/* Genre badge */}
                                                    {film.genre && (
                                                        <div className="mb-2">
                                                            <span className="bg-primary/80 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                                                {film.genre}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Title */}
                                                    <h3 className="mb-1 line-clamp-2 text-xl font-bold text-white">{film.title}</h3>

                                                    {/* Info row */}
                                                    <div className="mt-2 flex items-center justify-between">
                                                        <span className="text-sm text-gray-300">{film.duration} min</span>
                                                        <Link
                                                            href={`/films/${film.id}`}
                                                            className="text-primary text-sm font-medium transition-colors duration-200"
                                                        >
                                                            Details
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Full clickable overlay */}
                                        <Link
                                            href={`/films/${film.id}`}
                                            className="absolute inset-0 z-10"
                                            aria-label={`View details for ${film.title}`}
                                        >
                                            <span className="sr-only">View details</span>
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {/* Pagination */}
                        {films.last_page > 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="mt-12"
                            >
                                <Pagination currentPage={films.current_page} totalPages={films.last_page} links={films.links} />
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
