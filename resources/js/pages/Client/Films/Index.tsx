import { Pagination } from '@/components/ui/pagination';
import ClientLayout from '@/layouts/ClientLayout';
import { ImagePreloader } from '@/components/ui/ImagePreloader';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { debounce } from '@/utils/debounce';
import { getOptimizedImageUrl } from '@/utils/image';

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
    const [currentPage, setCurrentPage] = useState(films.current_page);
    const [scrollY, setScrollY] = useState(0);

    // Animation hooks with reduced reflow triggers
    const [headerRef, headerInView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
        rootMargin: '50px'
    });

    // Update current page when films prop changes
    useEffect(() => {
        setCurrentPage(films.current_page);
    }, [films.current_page]);

    // Debounced scroll handler
    useEffect(() => {
        const handleScroll = debounce(() => {
            requestAnimationFrame(() => {
                setScrollY(window.scrollY);
            });
        }, 10);

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            handleScroll.cancel();
        };
    }, []);

    // Optimized filter application with debounce
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            router.get(
                '/films',
                {
                    search,
                    genre: selectedGenre,
                    page: search || selectedGenre ? 1 : currentPage // Reset to page 1 only when filters change
                },
                { preserveState: true, replace: true }
            );
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [search, selectedGenre, currentPage]);

    // Simplified animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } }
    };

    return (
        <ClientLayout>
            <Head title="Explore Films | CineVerse" />

            {/* Hero Section with optimized parallax */}
            <section className="relative py-24 overflow-hidden bg-black">
                <div
                    className="absolute inset-0 bg-black opacity-50"
                    style={{
                        backgroundImage: 'url(/storage/images/cinema-pattern.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transform: `translateY(${scrollY * 0.1}px)`,
                        willChange: 'transform'
                    }}
                />

                <div ref={headerRef} className="relative z-10 px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
                            Discover <span className="text-primary">Cinematic</span> Treasures
                        </h1>
                    </motion.div>
                </div>
            </section>

            <div className="py-12 from-black">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Filters Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="mb-8"
                    >
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Search Input */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search films..."
                                    className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:ring-primary"
                                />
                            </div>

                            {/* Genre Filter */}
                            <select
                                value={selectedGenre}
                                onChange={(e) => setSelectedGenre(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:ring-primary"
                            >
                                <option value="">All Genres</option>
                                {genres.map((genre) => (
                                    <option key={genre} value={genre}>
                                        {genre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </motion.div>

                    {/* Films Grid */}
                    {films.data.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-12 text-center"
                        >
                            <p className="text-gray-400">No films found matching your criteria</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        >
                            {films.data.map((film, index) => (
                                <Link
                                    key={film.id}
                                    href={`/films/${film.id}`}
                                    className="relative overflow-hidden transition-transform duration-300 bg-gray-800 rounded-lg hover:-translate-y-1"
                                >
                                    <div className="aspect-[2/3] relative">
                                        <ImagePreloader
                                            src={film.poster_image || ''}
                                            alt={film.title}
                                            width={300}
                                            height={450}
                                            priority={index < 4}
                                            quality={80}
                                            className="w-full h-full"
                                        />
                                        <div className="absolute inset-0 transition-opacity bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-60" />
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        {film.genre && (
                                            <span className="inline-block px-2 py-1 mb-2 text-xs font-medium text-white rounded-full bg-primary/80">
                                                {film.genre}
                                            </span>
                                        )}
                                        <h3 className="mb-1 text-lg font-bold text-white line-clamp-2">
                                            {film.title}
                                        </h3>
                                        <p className="text-sm text-gray-300">{film.duration} min</p>
                                    </div>
                                </Link>
                            ))}
                        </motion.div>
                    )}

                    {/* Pagination */}
                    {films.last_page > 1 && (
                        <div className="mt-8">
                            <Pagination
                                currentPage={films.current_page}
                                totalPages={films.last_page}
                                links={films.links}
                            />
                        </div>
                    )}
                </div>
            </div>
        </ClientLayout>
    );
}
