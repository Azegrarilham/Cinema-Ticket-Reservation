import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface Film {
    id: number;
    title: string;
    description: string;
    poster_image: string | null;
    genre: string | null;
    duration: number;
    director: string | null;
}

interface FeaturedFilmsSectionProps {
    featuredFilms: Film[];
}

const FeaturedFilmsSection = ({ featuredFilms }: FeaturedFilmsSectionProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    const [featuredRef, featuredInView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <section
            id="featured"
            ref={featuredRef}
            className="relative py-24 overflow-hidden"
            style={{
                background: 'linear-gradient(to bottom, #000203, #01080c)',
            }}
        >
            {/* Abstract Film Strip Background */}
            <div className="absolute inset-0 overflow-hidden opacity-5">
                <div className="absolute top-0 left-0 right-0 h-40 from-primary/10 bg-gradient-to-b to-transparent" />
                <div className="flex h-full">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="flex-1 h-full border-r border-white/20"
                            initial={{ height: '0%' }}
                            animate={{ height: '100%' }}
                            transition={{
                                duration: 1.5,
                                delay: i * 0.1,
                                ease: 'easeOut',
                            }}
                        />
                    ))}
                </div>
            </div>

            <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                {/* Section Header with Animation */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={featuredInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.8 }}
                    className="mb-20 text-center"
                >
                    <div className="inline-flex items-center justify-center">
                        <span className="bg-primary/70 h-[1px] w-8"></span>
                        <span className="text-primary/80 mx-3 text-sm font-medium tracking-[0.2em] uppercase">Spotlight</span>
                        <span className="bg-primary/70 h-[1px] w-8"></span>
                    </div>
                    <h2 className="mt-4 text-4xl font-bold tracking-tight text-transparent bg-gradient-to-r from-white to-white/80 bg-clip-text">
                        Film Recommendations
                    </h2>
                    <div className="flex justify-center mt-4">
                        <motion.div
                            className="w-24 h-1 rounded-full from-primary to-primary/50 bg-gradient-to-r"
                            initial={{ width: 0 }}
                            animate={featuredInView ? { width: '6rem' } : { width: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        />
                    </div>
                    <p className="max-w-2xl mx-auto mt-6 text-lg text-gray-300/80">
                        Discover our curated selection of films from around the world that we think you'll love
                    </p>
                </motion.div>

                {/* Enhanced Recommended Film Carousel */}
                <div className="relative">
                    {/* Custom Navigation Controls */}
                    <div className="absolute z-10 flex items-center justify-between w-full px-4 transform -translate-y-1/2 top-1/2">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCurrentIndex((prev) => (prev === 0 ? featuredFilms.length - 1 : prev - 1))}
                            className="flex items-center justify-center w-12 h-12 text-white transition-all duration-300 border rounded-full hover:bg-primary/70 border-white/10 bg-black/50 backdrop-blur-sm focus:outline-none"
                            aria-label="Previous film"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCurrentIndex((prev) => (prev === featuredFilms.length - 1 ? 0 : prev + 1))}
                            className="flex items-center justify-center w-12 h-12 text-white transition-all duration-300 border rounded-full hover:bg-primary/70 border-white/10 bg-black/50 backdrop-blur-sm focus:outline-none"
                            aria-label="Next film"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </motion.button>
                    </div>

                    {featuredFilms.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={featuredInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative h-[600px] overflow-hidden rounded-3xl shadow-2xl"
                        >
                            <div className="absolute inset-0 overflow-hidden rounded-3xl border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
                                <AnimatePresence>
                                    {featuredFilms.map((film, index) => (
                                        <motion.div
                                            key={film.id}
                                            initial={{ opacity: 0 }}
                                            animate={{
                                                opacity: currentIndex === index ? 1 : 0,
                                                zIndex: currentIndex === index ? 1 : 0,
                                            }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.7 }}
                                            className="absolute inset-0 flex w-full h-full"
                                            onMouseEnter={() => setIsVideoPlaying(true)}
                                            onMouseLeave={() => setIsVideoPlaying(false)}
                                        >
                                            <div className="relative w-1/2">
                                                <div
                                                    className="absolute inset-0"
                                                    style={{
                                                        background: 'linear-gradient(to right, rgba(0,0,0,0.95) 40%, transparent)',
                                                    }}
                                                />
                                                <div className="relative z-10 flex flex-col justify-center h-full p-12">
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.3, duration: 0.5 }}
                                                    >
                                                        <div className="flex items-center mb-6">
                                                            <span className="flex items-center px-4 py-1 text-sm font-medium text-white rounded-full bg-primary/80 backdrop-blur-sm">
                                                                <svg
                                                                    className="w-4 h-4 mr-1"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                                                                    />
                                                                </svg>
                                                                {film.genre || 'Recommended'}
                                                            </span>

                                                            {index === currentIndex && (
                                                                <div className="flex items-center ml-4 space-x-1">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <motion.div
                                                                            key={i}
                                                                            className="bg-primary/80 h-1.5 w-1.5 rounded-full"
                                                                            animate={{
                                                                                scale: [1, 1.5, 1],
                                                                                opacity: [0.7, 1, 0.7],
                                                                            }}
                                                                            transition={{
                                                                                duration: 1,
                                                                                delay: i * 0.15,
                                                                                repeat: Infinity,
                                                                                repeatDelay: 0.5,
                                                                            }}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>

                                                    <motion.h3
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.4, duration: 0.5 }}
                                                        className="text-5xl font-bold leading-tight text-white"
                                                    >
                                                        {film.title}
                                                    </motion.h3>

                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.5, duration: 0.5 }}
                                                        className="flex items-center mt-4 space-x-4 text-white/70"
                                                    >
                                                        <span className="flex items-center">
                                                            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                />
                                                            </svg>
                                                            {film.duration} min
                                                        </span>
                                                        {film.director && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="flex items-center">
                                                                    <svg
                                                                        className="w-4 h-4 mr-1"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                                        />
                                                                    </svg>
                                                                    {film.director}
                                                                </span>
                                                            </>
                                                        )}
                                                    </motion.div>

                                                    <motion.p
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.6, duration: 0.5 }}
                                                        className="mt-6 text-lg font-light line-clamp-4 text-white/80"
                                                    >
                                                        {film.description}
                                                    </motion.p>

                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.7, duration: 0.5 }}
                                                        className="mt-8"
                                                    >
                                                        <Link
                                                            href={`/films/${film.id}`}
                                                            className="relative inline-flex items-center px-8 py-3 overflow-hidden font-medium text-white transition-all duration-300 rounded-full group"
                                                        >
                                                            <span className="absolute inset-0 z-0 rounded-full from-primary to-primary/80 bg-gradient-to-r"></span>
                                                            <span className="relative z-10 flex items-center">
                                                                Book Tickets
                                                                <svg
                                                                    className="w-5 h-5 ml-2 transition-transform duration-300 transform group-hover:translate-x-1"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                                                                    />
                                                                </svg>
                                                            </span>
                                                            <motion.span
                                                                className="absolute inset-0 rounded-full -z-10 bg-white/20"
                                                                whileHover={{ scale: 1.5, opacity: 0.3 }}
                                                                transition={{ duration: 0.4 }}
                                                            />
                                                        </Link>
                                                    </motion.div>
                                                </div>
                                            </div>
                                            <div className="relative w-1/2 overflow-hidden">
                                                {film.poster_image ? (
                                                    <motion.img
                                                        src={
                                                            film.poster_image.startsWith('http')
                                                                ? film.poster_image
                                                                : `/storage/${film.poster_image}`
                                                        }
                                                        alt={film.title}
                                                        className="object-cover w-full h-full"
                                                        initial={{ scale: 1.1 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ duration: 0.8 }}
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-full bg-gray-800">
                                                        <span className="text-white/50">No image available</span>
                                                    </div>
                                                )}

                                                {/* Creative overlay with film details */}
                                                <div className="absolute inset-0 bg-gradient-to-l from-black/30 to-transparent" />

                                                {/* Film strip border design */}
                                                <div className="absolute top-0 left-0 right-0 flex h-8 overflow-hidden">
                                                    {[...Array(20)].map((_, i) => (
                                                        <div key={i} className="w-8 h-full bg-black border border-white/20" />
                                                    ))}
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 flex h-8 overflow-hidden">
                                                    {[...Array(20)].map((_, i) => (
                                                        <div key={i} className="w-8 h-full bg-black border border-white/20" />
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}

                    {/* Interactive Carousel Indicators */}
                    <div className="flex justify-center mt-8 space-x-3">
                        {featuredFilms.map((_, index) => (
                            <motion.button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                className={`relative h-3 rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-primary w-8' : 'w-3 bg-gray-400/30'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            >
                                {currentIndex === index && (
                                    <motion.span
                                        className="absolute inset-0 rounded-full bg-primary/50"
                                        initial={{ scale: 1 }}
                                        animate={{ scale: 1.5, opacity: 0 }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedFilmsSection;
