import ClientLayout from '@/layouts/ClientLayout';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Search() {
    const { data, setData, post, processing, errors, reset } = useForm<{
        confirmation_code: string;
    }>({
        confirmation_code: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('reservations.search.post'));
    };

    return (
        <ClientLayout>
            <Head title="Find Your Reservation | CineVerse" />
            <div className="py-20 bg-gradient-to-b from-gray-900 to-black">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="max-w-2xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Find Your Reservation</h1>
                            <p className="mt-4 text-gray-400">
                                Enter your confirmation code to view your ticket details
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mt-12"
                        >
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <div className="relative mt-2 rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                                        </div>
                                        <input
                                            type="text"
                                            name="confirmation_code"
                                            id="confirmation_code"
                                            value={data.confirmation_code}
                                            onChange={(e) => setData('confirmation_code', e.target.value)}
                                            className="block w-full py-3 pl-10 text-white bg-gray-800 border-gray-700 rounded-md focus:border-primary focus:ring-primary"
                                            placeholder="Enter confirmation code"
                                        />
                                    </div>
                                    {errors.confirmation_code && (
                                        <p className="mt-2 text-sm text-red-500">{errors.confirmation_code}</p>
                                    )}
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex items-center justify-center w-full px-4 py-3 text-base font-medium text-white border border-transparent rounded-md shadow-sm bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                    >
                                        {processing ? 'Searching...' : 'Find Reservation'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="mt-12 text-gray-400"
                        >
                            <p className="text-sm">
                                Your confirmation code can be found in your ticket email or PDF ticket
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
