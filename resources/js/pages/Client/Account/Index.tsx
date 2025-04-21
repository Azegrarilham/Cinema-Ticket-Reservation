import ClientLayout from '@/layouts/ClientLayout';
import { Cog6ToothIcon, CreditCardIcon, UserIcon } from '@heroicons/react/24/outline';
import { Head, Link } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Props {
    user: User;
}

export default function Index({ user }: Props) {
    return (
        <ClientLayout>
            <Head title="My Account" />

            <div className="min-h-screen pt-8 pb-20 bg-gradient-to-b from-neutral-900 to-black">
                <div className="container px-4 mx-auto">
                    <h1 className="mb-8 text-3xl font-bold text-white">My Account</h1>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {/* Sidebar */}
                        <div className="md:col-span-1">
                            <div className="p-6 border rounded-xl border-neutral-700 bg-neutral-800/50">
                                <div className="flex items-center mb-6 space-x-4">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary">
                                        <UserIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">{user.name}</h2>
                                        <p className="text-neutral-400">{user.email}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Link
                                        href={route('account.index')}
                                        className="flex items-center w-full p-3 transition-colors rounded-md bg-primary/10 text-primary"
                                    >
                                        <UserIcon className="w-5 h-5 mr-3" />
                                        Profile
                                    </Link>
                                    <Link
                                        href={route('account.reservations')}
                                        className="flex items-center w-full p-3 transition-colors rounded-md text-neutral-300 hover:bg-neutral-700/30"
                                    >
                                        <CreditCardIcon className="w-5 h-5 mr-3" />
                                        My Reservations
                                    </Link>
                                    <Link
                                        href={route('account.settings')}
                                        className="flex items-center w-full p-3 transition-colors rounded-md text-neutral-300 hover:bg-neutral-700/30"
                                    >
                                        <Cog6ToothIcon className="w-5 h-5 mr-3" />
                                        Settings
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Main content */}
                        <div className="md:col-span-2">
                            <div className="p-6 border rounded-xl border-neutral-700 bg-neutral-800/50">
                                <h2 className="mb-6 text-2xl font-semibold text-white">Profile Information</h2>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="mb-2 text-sm font-medium text-neutral-400">Name</h3>
                                        <p className="text-white">{user.name}</p>
                                    </div>

                                    <div>
                                        <h3 className="mb-2 text-sm font-medium text-neutral-400">Email</h3>
                                        <p className="text-white">{user.email}</p>
                                    </div>

                                    <div>
                                        <h3 className="mb-2 text-sm font-medium text-neutral-400">Account Type</h3>
                                        <p className="text-white capitalize">{user.role}</p>
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-neutral-700">
                                        <Link
                                            href={route('account.settings')}
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-primary hover:bg-primary/90"
                                        >
                                            <Cog6ToothIcon className="w-4 h-4 mr-2" />
                                            Edit Profile Settings
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
