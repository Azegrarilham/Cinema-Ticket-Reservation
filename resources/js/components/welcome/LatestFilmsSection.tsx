import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

interface Film {
    id: number;
    title: string;
    description: string;
    poster_image: string | null;
    genre: string | null;
    duration: number;
    director: string | null;
}

interface LatestFilmsSectionProps {
    latestFilms: Film[];
}

const LatestFilmsSection = ({ latestFilms }: LatestFilmsSectionProps) => {
    // Film cards hover animation
    const cardVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.05, transition: { duration: 0.3 } },
    };

    return (
        <section
            className="relative py-24 overflow-hidden"
            style={{
                background: 'linear-gradient(to bottom, #000203, #01080c)',
            }}
        >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden opacity-5">
                {/* Abstract film strips */}
                <div className="grid h-full grid-cols-12">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="h-full border-r border-white/10" />
                    ))}
                </div>

                {/* Floating cinema elements */}
                <motion.div
                    className="absolute w-40 h-40 rounded-full bg-primary/5 -top-20 -right-20 blur-3xl"
                    animate={{
                        x: [0, 30, 0],
                        y: [0, -30, 0],
                        opacity: [0.5, 0.7, 0.5],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 15,
                        ease: 'easeInOut',
                    }}
                />

                <motion.div
                    className="absolute rounded-full bg-primary/5 bottom-40 -left-20 h-60 w-60 blur-3xl"
                    animate={{
                        x: [0, -20, 0],
                        y: [0, 40, 0],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 20,
                        ease: 'easeInOut',
                    }}
                />
            </div>

            <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-20 text-center"
                >
                    <div className="inline-flex items-center justify-center">
                        <span className="bg-primary/70 h-[1px] w-8"></span>
                        <span className="text-primary/80 mx-3 text-sm font-medium tracking-[0.2em] uppercase">Now Playing</span>
                        <span className="bg-primary/70 h-[1px] w-8"></span>
                    </div>
                    <h2 className="mt-4 text-4xl font-bold tracking-tight text-transparent bg-gradient-to-r from-white to-white/80 bg-clip-text">
                        Latest Releases
                    </h2>
                    <div className="flex justify-center mt-4">
                        <motion.div
                            className="w-24 h-1 rounded-full from-primary to-primary/50 bg-gradient-to-r"
                            initial={{ width: 0 }}
                            whileInView={{ width: '6rem' }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        />
                    </div>
                    <p className="max-w-2xl mx-auto mt-6 text-lg text-gray-300/80">
                        Don't miss these exciting new films showing now in our premium theaters
                    </p>
                </motion.div>

                {/* 3D Perspective Film Cards Grid */}
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                    {latestFilms.map((film, index) => (
                        <motion.div
                            key={film.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{
                                z: 10,
                                transition: { duration: 0.2 },
                            }}
                        >
                            <Link href={`/films/${film.id}`}>
                                <motion.div
                                    className="group relative h-[460px] overflow-hidden rounded-2xl border border-white/5 bg-black/20 shadow-lg backdrop-blur-sm"
                                    variants={cardVariants}
                                    initial="initial"
                                    whileHover="hover"
                                    style={{
                                        perspective: '1000px',
                                        transformStyle: 'preserve-3d',
                                    }}
                                >
                                    {/* Card Image with Parallax Effect */}
                                    <div className="relative h-[280px] overflow-hidden">
                                        {film.poster_image ? (
                                            <motion.img
                                                src={film.poster_image.startsWith('http') ? film.poster_image : `/storage/${film.poster_image}`}
                                                alt={film.title}
                                                className="object-cover w-full h-full"
                                                whileHover={{
                                                    scale: 1.1,
                                                    transition: { duration: 0.5 },
                                                }}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full bg-gray-800 text-white/50">
                                                No image available
                                            </div>
                                        )}

                                        {/* Film Genre Badge */}
                                        <div className="absolute top-4 right-4">
                                            <span className="px-3 py-1 text-xs font-medium text-white border rounded-full border-white/10 bg-black/50 backdrop-blur-sm">
                                                {film.genre || 'Drama'}
                                            </span>
                                        </div>

                                        {/* Hover Overlay with Play Button */}
                                        <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black via-black/50 to-transparent group-hover:opacity-100">
                                            <motion.div
                                                className="p-3 rounded-full bg-primary/90"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Film Info */}
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xl font-bold text-white">{film.title}</h3>
                                            <span className="px-2 py-1 text-xs font-medium rounded-md bg-primary/20 text-primary">
                                                {film.duration} min
                                            </span>
                                        </div>
                                        <p className="mb-4 text-sm line-clamp-2 text-white/70">{film.description}</p>

                                        {/* Book Now Button */}
                                        <div className="group/button">
                                            <motion.div
                                                className="flex items-center justify-between p-3 overflow-hidden text-white transition-colors duration-300 border rounded-lg bg-primary/10 border-primary/20 group-hover/button:bg-primary/20 backdrop-blur-sm"
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <span className="text-sm font-medium">Book Now</span>
                                                <motion.svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    initial={{ x: 0 }}
                                                    whileHover={{ x: 3 }}
                                                    transition={{ type: 'spring', stiffness: 400 }}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                                                    />
                                                </motion.svg>
                                            </motion.div>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* View All Films Button */}
                <motion.div
                    className="flex justify-center mt-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Link
                        href="/films"
                        className="relative px-8 py-3 overflow-hidden text-lg font-medium text-white transition-all rounded-full group"
                    >
                        <span className="absolute inset-0 z-0 rounded-full from-primary/80 to-primary bg-gradient-to-r"></span>
                        <span className="relative z-10 flex items-center">
                            View All Films
                            <svg
                                className="w-5 h-5 ml-2 transition-transform duration-300 transform group-hover:translate-x-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
        </section>
    );
};

export default LatestFilmsSection;


