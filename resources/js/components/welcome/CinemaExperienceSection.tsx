import { motion } from 'framer-motion';

const CinemaExperienceSection = () => {
    return (
        <section
            className="relative py-24 overflow-hidden"
            style={{
                background: 'transparent',
            }}
        >
            <div className="absolute inset-0 opacity-30">
                {/* Abstract cinema-themed background pattern with dots */}
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
                        <circle cx="8" cy="8" r="0.6" fill="white" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#dots)" />
                </svg>
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
                        <span className="text-primary/80 mx-3 text-sm font-medium tracking-[0.2em] uppercase">Premium</span>
                        <span className="bg-primary/70 h-[1px] w-8"></span>
                    </div>
                    <h2 className="mt-4 text-4xl font-bold tracking-tight text-transparent bg-gradient-to-r from-white to-white/80 bg-clip-text">
                        The Ultimate Cinema Experience
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
                    <p className="max-w-2xl mx-auto mt-6 text-lg text-gray-300/80">Every detail designed for your comfort and enjoyment</p>
                </motion.div>

                {/* Experience Features */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {[
                        {
                            icon: (
                                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                                    />
                                </svg>
                            ),
                            title: 'Cutting-Edge Screens',
                            description: 'Experience movies on our state-of-the-art 4K digital projection systems with crystal clear images.',
                        },
                        {
                            icon: (
                                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 01-.707-7.07m-2.122 9.9a9 9 0 010-12.728"
                                    />
                                </svg>
                            ),
                            title: 'Immersive Sound',
                            description: 'Dolby Atmos® surround sound technology places you at the center of the action.',
                        },
                        {
                            icon: (
                                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                    />
                                </svg>
                            ),
                            title: 'Luxury Seating',
                            description: 'Sink into our premium reclining seats with extra legroom and personal space for ultimate comfort.',
                        },
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            className="p-8 transition-colors duration-300 border rounded-3xl border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10"
                        >
                            <div className="flex items-center justify-center w-16 h-16 mb-6 bg-primary/20 rounded-2xl">{feature.icon}</div>
                            <h3 className="mb-4 text-2xl font-bold text-white">{feature.title}</h3>
                            <p className="text-white/70">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CinemaExperienceSection;
