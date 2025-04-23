import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { fetchUpcomingMovies, getImageUrl } from '@/utils/tmdbApi';

interface Movie {
    id: string;
    title: string;
    poster_path: string;
    release_date: string;
    overview: string;
    director?: string;
    genre?: string;
    runtime?: string;
}

const UpcomingMoviesSection = () => {
    const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [sectionRef, inView] = useInView({
        triggerOnce: false,
        threshold: 0.1,
    });

    const getUpcomingMovies = async () => {
        try {
            setLoading(true);
            setError('');
            const movies = await fetchUpcomingMovies();
            setUpcomingMovies(movies);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching upcoming movies:', err);
            setError('Failed to load upcoming movies. Please try again later.');
            setLoading(false);
        }
    };

    useEffect(() => {
        getUpcomingMovies();
    }, []);

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
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
            },
        },
    };

    // Format release date for display
    const formatReleaseDate = (dateString: string) => {
        try {
            const year = dateString.split('-')[0];
            return year;
        } catch (e) {
            return 'Coming Soon';
        }
    };

    // Truncate text and add ellipsis
    const truncateText = (text: string, maxLength: number) => {
        if (!text) return '';
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

    return (
        <section ref={sectionRef} id="upcoming" className="py-16 md:py-24">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex items-center mb-8 md:mb-12">
                    <div className="w-12 h-1 mr-4 rounded-full bg-primary" />
                    <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">Coming Soon</h2>
                </div>

                <p className="max-w-3xl mb-10 text-lg text-white/80">
                    Get a sneak peek at the most anticipated films coming soon to CineVerse.
                    Be the first to experience these blockbusters on our premium screens.
                </p>

                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-t-primary border-white/20 rounded-full animate-spin" />
                    </div>
                )}

                {error && (
                    <div className="p-8 text-center rounded-lg bg-red-500/10">
                        <p className="mb-4 text-red-400">{error}</p>
                        <button
                            onClick={getUpcomingMovies}
                            className="px-4 py-2 text-sm font-medium transition-colors rounded-md bg-primary text-white hover:bg-primary/90"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && upcomingMovies.length === 0 && (
                    <div className="p-8 text-center rounded-lg bg-yellow-500/10">
                        <p className="mb-4 text-yellow-400">No upcoming movies found at this time.</p>
                        <button
                            onClick={getUpcomingMovies}
                            className="px-4 py-2 text-sm font-medium transition-colors rounded-md bg-primary text-white hover:bg-primary/90"
                        >
                            Refresh
                        </button>
                    </div>
                )}

                {!loading && !error && upcomingMovies.length > 0 && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate={inView ? "visible" : "hidden"}
                        className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {upcomingMovies.map((movie) => (
                            <motion.div
                                key={movie.id}
                                variants={itemVariants}
                                className="overflow-hidden transition-transform duration-300 transform rounded-lg shadow-lg hover:scale-105 bg-black/40 backdrop-blur-sm"
                            >
                                <div className="relative aspect-[2/3]">
                                    <img
                                        src={getImageUrl(movie.poster_path)}
                                        alt={movie.title}
                                        className="object-cover w-full h-full"
                                        onError={(e) => {
                                            e.currentTarget.src = '/storage/images/poster-placeholder.jpg';
                                        }}
                                    />
                                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-center p-4 text-white bg-gradient-to-t from-black to-transparent">
                                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary">
                                            Coming {formatReleaseDate(movie.release_date)}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="mb-2 text-xl font-bold text-white">{movie.title}</h3>
                                    {movie.genre && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {movie.genre.split(',').slice(0, 3).map((genre, index) => (
                                                <span key={index} className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/70">
                                                    {genre.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <p className="mb-4 text-sm text-white/70">
                                        {truncateText(movie.overview || '', 120)}
                                    </p>
                                    {movie.director && (
                                        <p className="mb-3 text-xs text-white/60">
                                            <span className="font-medium">Director:</span> {movie.director}
                                        </p>
                                    )}
                                    <button className="flex items-center text-sm font-medium transition-colors text-primary hover:text-primary/80">
                                        <span>Add to Watchlist</span>
                                        <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default UpcomingMoviesSection;
