import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { ImagePreloader } from '@/components/ui/ImagePreloader';

interface Film {
    id: number;
    title: string;
    description: string;
    poster_image: string | null;
    genre: string | null;
    duration: number;
    director: string | null;
}

export default function FeaturedFilmsSection({ featuredFilms }: { featuredFilms: Film[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Reduced animation complexity
    const slideVariants = {
        enter: { opacity: 0, scale: 0.95 },
        center: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3 }
        },
        exit: {
            opacity: 0,
            scale: 1.05,
            transition: { duration: 0.2 }
        }
    };

    return (
        <section className="relative py-20 overflow-hidden bg-gradient-to-b from-black to-gray-900">
            <div className="container px-4 mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                        Featured Films
                    </h2>
                    <div className="w-20 h-1 mx-auto bg-primary/50" />
                </motion.div>

                {/* Featured Films Carousel */}
                <div className="relative mt-12">
                    <div className="relative max-w-5xl mx-auto overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="w-full"
                            >
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Film Poster */}
                                    <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
                                        <ImagePreloader
                                            src={featuredFilms[currentIndex].poster_image || ''}
                                            alt={featuredFilms[currentIndex].title}
                                            width={400}
                                            height={600}
                                            priority={true}
                                            quality={85}
                                            className="w-full h-full"
                                        />
                                    </div>

                                    {/* Film Info */}
                                    <div className="flex flex-col justify-center p-6">
                                        <h3 className="mb-4 text-2xl font-bold text-white">
                                            {featuredFilms[currentIndex].title}
                                        </h3>
                                        {featuredFilms[currentIndex].genre && (
                                            <span className="inline-block px-3 py-1 mb-4 text-sm text-white rounded-full w-fit bg-primary/80">
                                                {featuredFilms[currentIndex].genre}
                                            </span>
                                        )}
                                        <p className="mb-6 text-gray-300">
                                            Duration: {featuredFilms[currentIndex].duration} minutes
                                        </p>
                                        <Link
                                            href={`/films/${featuredFilms[currentIndex].id}`}
                                            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white transition rounded-lg w-fit bg-primary hover:bg-primary/90"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex justify-center mt-8 space-x-2">
                        {featuredFilms.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === index ? 'w-6 bg-primary' : 'bg-gray-600'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
