import ClientLayout from '@/layouts/ClientLayout';
import { Cog6ToothIcon, CreditCardIcon, KeyIcon, UserIcon } from '@heroicons/react/24/outline';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Props {
    user: User;
    success?: string;
    errors?: {
        name?: string;
        email?: string;
        current_password?: string;
        password?: string;
        password_confirmation?: string;
    };
}

export default function Settings({ user, success, errors }: Props) {
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

    const profileForm = useForm({
        name: user.name,
        email: user.email,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.put(route('account.profile.update'));
    };

    const updatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put(route('account.password.update'));
    };

    return (
        <ClientLayout>
            <Head title="Account Settings" />

            <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-black pt-8 pb-20">
                <div className="container mx-auto px-4">
                    <h1 className="mb-8 text-3xl font-bold text-white">Account Settings</h1>

                    {success && (
                        <div className="mb-6 rounded-md bg-green-900/30 p-4 text-green-300">
                            <p>{success}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {/* Sidebar */}
                        <div className="md:col-span-1">
                            <div className="rounded-xl border border-neutral-700 bg-neutral-800/50 p-6">
                                <div className="mb-6 flex items-center space-x-4">
                                    <div className="bg-primary/20 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                                        <UserIcon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">{user.name}</h2>
                                        <p className="text-neutral-400">{user.email}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Link
                                        href={route('account.index')}
                                        className="flex w-full items-center rounded-md p-3 text-neutral-300 transition-colors hover:bg-neutral-700/30"
                                    >
                                        <UserIcon className="mr-3 h-5 w-5" />
                                        Profile
                                    </Link>
                                    <Link
                                        href={route('account.reservations')}
                                        className="flex w-full items-center rounded-md p-3 text-neutral-300 transition-colors hover:bg-neutral-700/30"
                                    >
                                        <CreditCardIcon className="mr-3 h-5 w-5" />
                                        My Reservations
                                    </Link>
                                    <Link
                                        href={route('account.settings')}
                                        className="bg-primary/10 text-primary flex w-full items-center rounded-md p-3 transition-colors"
                                    >
                                        <Cog6ToothIcon className="mr-3 h-5 w-5" />
                                        Settings
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Main content */}
                        <div className="md:col-span-2">
                            <div className="rounded-xl border border-neutral-700 bg-neutral-800/50 p-6">
                                {/* Tabs */}
                                <div className="mb-6 flex border-b border-neutral-700">
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`mr-4 border-b-2 pb-3 text-sm font-medium transition-all ${
                                            activeTab === 'profile'
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-neutral-400 hover:text-white'
                                        }`}
                                    >
                                        Profile Information
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('password')}
                                        className={`mr-4 border-b-2 pb-3 text-sm font-medium transition-all ${
                                            activeTab === 'password'
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-neutral-400 hover:text-white'
                                        }`}
                                    >
                                        Password
                                    </button>
                                </div>

                                {/* Profile Tab */}
                                {activeTab === 'profile' && (
                                    <form onSubmit={updateProfile}>
                                        <div className="mb-4">
                                            <label htmlFor="name" className="mb-2 block text-sm font-medium text-neutral-300">
                                                Name
                                            </label>
                                            <input
                                                id="name"
                                                type="text"
                                                value={profileForm.data.name}
                                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                                className="focus:border-primary focus:ring-primary w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-white focus:outline-none"
                                            />
                                            {errors?.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                                        </div>

                                        <div className="mb-6">
                                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-neutral-300">
                                                Email
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                value={profileForm.data.email}
                                                onChange={(e) => profileForm.setData('email', e.target.value)}
                                                className="focus:border-primary focus:ring-primary w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-white focus:outline-none"
                                            />
                                            {errors?.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={profileForm.processing}
                                            className="bg-primary hover:bg-primary/90 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-70"
                                        >
                                            {profileForm.processing ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </form>
                                )}

                                {/* Password Tab */}
                                {activeTab === 'password' && (
                                    <form onSubmit={updatePassword}>
                                        <div className="mb-4">
                                            <label htmlFor="current_password" className="mb-2 block text-sm font-medium text-neutral-300">
                                                Current Password
                                            </label>
                                            <input
                                                id="current_password"
                                                type="password"
                                                value={passwordForm.data.current_password}
                                                onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                                className="focus:border-primary focus:ring-primary w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-white focus:outline-none"
                                            />
                                            {errors?.current_password && <p className="mt-1 text-sm text-red-500">{errors.current_password}</p>}
                                        </div>

                                        <div className="mb-4">
                                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-neutral-300">
                                                New Password
                                            </label>
                                            <input
                                                id="password"
                                                type="password"
                                                value={passwordForm.data.password}
                                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                                className="focus:border-primary focus:ring-primary w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-white focus:outline-none"
                                            />
                                            {errors?.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                                        </div>

                                        <div className="mb-6">
                                            <label htmlFor="password_confirmation" className="mb-2 block text-sm font-medium text-neutral-300">
                                                Confirm New Password
                                            </label>
                                            <input
                                                id="password_confirmation"
                                                type="password"
                                                value={passwordForm.data.password_confirmation}
                                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                                className="focus:border-primary focus:ring-primary w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-white focus:outline-none"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <button
                                                type="submit"
                                                disabled={passwordForm.processing}
                                                className="bg-primary hover:bg-primary/90 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-70"
                                            >
                                                <KeyIcon className="mr-2 h-4 w-4" />
                                                {passwordForm.processing ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
