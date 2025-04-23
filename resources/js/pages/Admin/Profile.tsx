import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';
import { Transition } from '@headlessui/react';
import KeyIcon from '@heroicons/react/24/outline/KeyIcon.js';
import UserCircleIcon from '@heroicons/react/24/outline/UserCircleIcon.js';
import UserIcon from '@heroicons/react/24/outline/UserIcon.js';
import { Head, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { FormEventHandler, useState } from 'react';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            when: 'beforeChildren',
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 100 }
    },
};

export default function Profile() {
    const { auth } = usePage().props;
    const [currentSection, setCurrentSection] = useState('profile');

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email,
    });

    const {
        data: passwordData,
        setData: setPasswordData,
        reset: resetPasswordData,
        patch: patchPassword,
        errors: passwordErrors,
        processing: passwordProcessing,
        recentlySuccessful: passwordRecentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updateProfile: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('admin.profile.update'), {
            preserveScroll: true,
        });
    };

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        patchPassword(route('admin.profile.update-password'), {
            preserveScroll: true,
            onSuccess: () => resetPasswordData(),
        });
    };

    return (
        <AdminLayout title="My Profile" subtitle="Manage your account information">
            <Head title="Admin Profile" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-6 md:flex-row"
            >
                {/* Sidebar Navigation */}
                <motion.div variants={itemVariants} className="w-full md:w-64">
                    <Card className="bg-card shadow-sm p-4">
                        <div className="flex flex-col space-y-1">
                            <Button
                                variant={currentSection === 'profile' ? 'default' : 'ghost'}
                                className="justify-start"
                                onClick={() => setCurrentSection('profile')}
                            >
                                <UserIcon className="mr-2 h-5 w-5" />
                                Profile Information
                            </Button>
                            <Button
                                variant={currentSection === 'password' ? 'default' : 'ghost'}
                                className="justify-start"
                                onClick={() => setCurrentSection('password')}
                            >
                                <KeyIcon className="mr-2 h-5 w-5" />
                                Change Password
                            </Button>
                        </div>
                    </Card>
                </motion.div>

                {/* Main Content */}
                <motion.div variants={itemVariants} className="flex-1">
                    {currentSection === 'profile' && (
                        <Card className="bg-card shadow-sm p-6">
                            <div className="mb-6 flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="bg-primary/10 border-primary flex h-20 w-20 items-center justify-center rounded-full border text-center">
                                        <UserCircleIcon className="text-primary h-12 w-12" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold">{data.name}</h3>
                                    <p className="text-muted-foreground">{data.email}</p>
                                    <p className="text-muted-foreground mt-1 text-sm">Administrator</p>
                                </div>
                            </div>

                            <form onSubmit={updateProfile} className="space-y-6">
                                <motion.div variants={itemVariants} className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="focus:ring-primary focus:border-primary"
                                        required
                                    />
                                    {errors.name && <p className="text-destructive mt-1 text-sm">{errors.name}</p>}
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="focus:ring-primary focus:border-primary"
                                        required
                                    />
                                    {errors.email && <p className="text-destructive mt-1 text-sm">{errors.email}</p>}
                                </motion.div>

                                <motion.div variants={itemVariants} className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
                                    >
                                        Save Changes
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out duration-300"
                                        enterFrom="opacity-0"
                                        enterTo="opacity-100"
                                        leave="transition ease-in-out duration-300"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-green-600">Saved</p>
                                    </Transition>
                                </motion.div>
                            </form>
                        </Card>
                    )}

                    {currentSection === 'password' && (
                        <Card className="bg-card shadow-sm p-6">
                            <h3 className="mb-4 text-lg font-semibold flex items-center">
                                <KeyIcon className="mr-2 h-5 w-5 text-primary" />
                                Change Password
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                Ensure your account is using a secure password to keep your account protected.
                            </p>

                            <form onSubmit={updatePassword} className="space-y-6">
                                <motion.div variants={itemVariants} className="space-y-2">
                                    <Label htmlFor="current_password" className="text-sm font-medium">Current Password</Label>
                                    <Input
                                        id="current_password"
                                        type="password"
                                        value={passwordData.current_password}
                                        onChange={(e) => setPasswordData('current_password', e.target.value)}
                                        className="focus:ring-primary focus:border-primary"
                                        required
                                    />
                                    {passwordErrors.current_password && (
                                        <p className="text-destructive mt-1 text-sm">{passwordErrors.current_password}</p>
                                    )}
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium">New Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={passwordData.password}
                                        onChange={(e) => setPasswordData('password', e.target.value)}
                                        className="focus:ring-primary focus:border-primary"
                                        required
                                    />
                                    {passwordErrors.password && <p className="text-destructive mt-1 text-sm">{passwordErrors.password}</p>}
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-2">
                                    <Label htmlFor="password_confirmation" className="text-sm font-medium">Confirm Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={passwordData.password_confirmation}
                                        onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                        className="focus:ring-primary focus:border-primary"
                                        required
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants} className="flex items-center gap-4">
                                    <Button
                                        disabled={passwordProcessing}
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
                                    >
                                        Update Password
                                    </Button>

                                    <Transition
                                        show={passwordRecentlySuccessful}
                                        enter="transition ease-in-out duration-300"
                                        enterFrom="opacity-0"
                                        enterTo="opacity-100"
                                        leave="transition ease-in-out duration-300"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-green-600">Password updated</p>
                                    </Transition>
                                </motion.div>
                            </form>
                        </Card>
                    )}
                </motion.div>
            </motion.div>
        </AdminLayout>
    );
}
