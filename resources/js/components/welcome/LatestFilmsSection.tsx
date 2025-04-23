import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
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

export default function LatestFilmsSection({ latestFilms }: { latestFilms: Film[] }) {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
        rootMargin: '50px'
    });

    return (
        <section className="py-20 bg-black">
            <div className="container px-4 mx-auto">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Latest Releases</h2>
                    <div className="w-20 h-1 mx-auto bg-primary/50" />
                </motion.div>

                <div
                    ref={ref}
                    className="grid gap-6 mt-12 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {latestFilms.map((film, index) => (
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
                                    priority={index < 3}
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
                </div>

                <div className="mt-12 text-center">
                    <Link
                        href="/films"
                        className="inline-flex items-center px-6 py-3 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-primary/90"
                    >
                        View All Films
                    </Link>
                </div>
            </div>
        </section>
    );
}
