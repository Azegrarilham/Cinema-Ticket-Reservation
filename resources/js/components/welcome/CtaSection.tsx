import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

const CtaSection = () => {
    return (
        <section className="relative py-24 from-primary/90 to-primary bg-gradient-to-r">
            <div className="absolute inset-0 overflow-hidden opacity-20">
                {/* Abstract cinema pattern */}
                <div className="absolute inset-0 flex flex-col">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex flex-1 border-b border-white/10">
                            {[...Array(20)].map((_, j) => (
                                <div key={j} className="flex-1 border-r border-white/10" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between md:flex-row">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-2xl mb-10 md:mb-0"
                    >
                        <h2 className="text-4xl font-bold leading-tight text-white">
                            Ready for the Ultimate <br />
                            Cinema Experience?
                        </h2>
                        <p className="mt-4 text-lg text-white/80">
                            Join us for an unforgettable journey through sound and vision. Book your tickets now.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Link
                            href="/films"
                            className="relative inline-flex items-center px-8 py-4 overflow-hidden text-lg font-medium transition-all bg-white rounded-full shadow-xl group text-primary hover:bg-white/90 focus:ring-2 focus:ring-white/20 focus:outline-none"
                        >
                            Browse All Films
                            <svg
                                className="w-5 h-5 ml-2 transition-transform duration-300 transform group-hover:translate-x-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                            <motion.span
                                className="absolute inset-0 rounded-full -z-10 bg-white/20"
                                whileHover={{ scale: 1.5, opacity: 0.3 }}
                                transition={{ duration: 0.4 }}
                            />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default CtaSection;
