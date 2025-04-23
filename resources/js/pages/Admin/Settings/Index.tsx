import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';
import UserPlusIcon from '@heroicons/react/24/outline/UserPlusIcon.js';
import UserIcon from '@heroicons/react/24/outline/UserIcon.js';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import React from 'react';

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

interface Admin {
    id: number;
    name: string;
    email: string;
}

interface Props {
    admins: Admin[];
}

export default function Index({ admins }: Props) {
    const { data, setData, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    return (
        <AdminLayout title="Settings" subtitle="Manage system settings and administrators">
            <Head title="Admin Settings" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-6 md:grid-cols-2"
            >
                <motion.div variants={itemVariants}>
                    <Card className="p-6 shadow-sm bg-card">
                        <div className="flex items-center mb-4">
                            <UserPlusIcon className="w-6 h-6 mr-2 text-primary" />
                            <h2 className="text-lg font-semibold">Add New Admin</h2>
                        </div>

                        <form className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="focus:ring-primary focus:border-primary"
                                    required
                                />
                                {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="focus:ring-primary focus:border-primary"
                                    required
                                />
                                {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className="focus:ring-primary focus:border-primary"
                                    required
                                />
                                {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation" className="text-sm font-medium">Confirm Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    className="focus:ring-primary focus:border-primary"
                                    required
                                />
                            </div>

                            <Button
                                type="button"
                                disabled={processing}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
                            >
                                <UserPlusIcon className="w-4 h-4 mr-2" />
                                Add Admin
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2">
                                Note: Admin management functionality will be available in a future update.
                            </p>
                        </form>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="p-6 shadow-sm bg-card">
                        <div className="flex items-center mb-4">
                            <UserIcon className="w-6 h-6 mr-2 text-primary" />
                            <h2 className="text-lg font-semibold">Admins</h2>
                        </div>

                        <div className="space-y-4">
                            {admins.length > 0 ? (
                                <div className="border rounded-md">
                                    <table className="min-w-full divide-y divide-border">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold">
                                                    Name
                                                </th>
                                                <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold">
                                                    Email
                                                </th>
                                                <th scope="col" className="relative px-4 py-3.5">
                                                    <span className="sr-only">Status</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {admins.map((admin) => (
                                                <motion.tr
                                                    key={admin.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.3 }}
                                                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                                                >
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-primary/10">
                                                                <UserIcon className="w-4 h-4 text-primary" />
                                                            </div>
                                                            <div className="ml-3">
                                                                <p className="font-medium">{admin.name}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm whitespace-nowrap">
                                                        {admin.email}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm font-medium text-right whitespace-nowrap">
                                                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-success/10 text-success">
                                                            Active
                                                        </span>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground">
                                    No administrators found.
                                </div>
                            )}
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </AdminLayout>
    );
}
