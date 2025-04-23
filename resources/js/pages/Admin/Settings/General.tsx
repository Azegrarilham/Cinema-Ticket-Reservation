import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';
import { Settings } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import Cog6ToothIcon from '@heroicons/react/24/outline/Cog6ToothIcon.js';
import BanknotesIcon from '@heroicons/react/24/outline/BanknotesIcon.js';
import FilmIcon from '@heroicons/react/24/outline/FilmIcon.js';
import BuildingOffice2Icon from '@heroicons/react/24/outline/BuildingOffice2Icon.js';
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

interface Props {
    settings: Settings;
}

export default function General({ settings }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        app_name: settings.app_name || '',
        app_description: settings.app_description || '',
        contact_email: settings.contact_email || '',
        contact_phone: settings.contact_phone || '',
        address: settings.address || '',
        currency: settings.currency || 'USD',
        ticket_price_regular: settings.ticket_price_regular?.toString() || '',
        ticket_price_vip: settings.ticket_price_vip?.toString() || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('admin.settings.general.update'));
    };

    return (
        <AdminLayout title="General Settings" subtitle="Configure general system settings">
            <Head title="General Settings" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div variants={itemVariants}>
                        <Card className="bg-card shadow-sm p-6">
                            <div className="mb-6 flex items-center">
                                <Cog6ToothIcon className="text-primary h-6 w-6 mr-2" />
                                <h2 className="text-lg font-semibold">Application Settings</h2>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="app_name" className="text-sm font-medium">Application Name</Label>
                                    <Input
                                        id="app_name"
                                        value={data.app_name}
                                        onChange={e => setData('app_name', e.target.value)}
                                        className="focus:ring-primary focus:border-primary"
                                    />
                                    {errors.app_name && <p className="text-destructive mt-1 text-sm">{errors.app_name}</p>}
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="app_description" className="text-sm font-medium">Application Description</Label>
                                    <Textarea
                                        id="app_description"
                                        value={data.app_description}
                                        onChange={e => setData('app_description', e.target.value)}
                                        rows={3}
                                        className="focus:ring-primary focus:border-primary"
                                    />
                                    {errors.app_description && <p className="text-destructive mt-1 text-sm">{errors.app_description}</p>}
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Card className="bg-card shadow-sm p-6">
                            <div className="mb-6 flex items-center">
                                <BuildingOffice2Icon className="text-primary h-6 w-6 mr-2" />
                                <h2 className="text-lg font-semibold">Contact Information</h2>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="contact_email" className="text-sm font-medium">Contact Email</Label>
                                    <Input
                                        id="contact_email"
                                        type="email"
                                        value={data.contact_email}
                                        onChange={e => setData('contact_email', e.target.value)}
                                        className="focus:ring-primary focus:border-primary"
                                    />
                                    {errors.contact_email && <p className="text-destructive mt-1 text-sm">{errors.contact_email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contact_phone" className="text-sm font-medium">Contact Phone</Label>
                                    <Input
                                        id="contact_phone"
                                        value={data.contact_phone}
                                        onChange={e => setData('contact_phone', e.target.value)}
                                        className="focus:ring-primary focus:border-primary"
                                    />
                                    {errors.contact_phone && <p className="text-destructive mt-1 text-sm">{errors.contact_phone}</p>}
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                                    <Textarea
                                        id="address"
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        rows={3}
                                        className="focus:ring-primary focus:border-primary"
                                    />
                                    {errors.address && <p className="text-destructive mt-1 text-sm">{errors.address}</p>}
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Card className="bg-card shadow-sm p-6">
                            <div className="mb-6 flex items-center">
                                <BanknotesIcon className="text-primary h-6 w-6 mr-2" />
                                <h2 className="text-lg font-semibold">Currency Settings</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
                                    <select
                                        id="currency"
                                        value={data.currency}
                                        onChange={e => setData('currency', e.target.value)}
                                        className="focus:ring-primary focus:border-primary mt-1 block w-full rounded-md border-border py-2 pl-3 pr-10 text-sm"
                                    >
                                        <option value="USD">US Dollar (USD)</option>
                                        <option value="EUR">Euro (EUR)</option>
                                        <option value="GBP">British Pound (GBP)</option>
                                        <option value="JPY">Japanese Yen (JPY)</option>
                                        <option value="CAD">Canadian Dollar (CAD)</option>
                                        <option value="AUD">Australian Dollar (AUD)</option>
                                    </select>
                                    {errors.currency && <p className="text-destructive mt-1 text-sm">{errors.currency}</p>}
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Card className="bg-card shadow-sm p-6">
                            <div className="mb-6 flex items-center">
                                <FilmIcon className="text-primary h-6 w-6 mr-2" />
                                <h2 className="text-lg font-semibold">Ticket Pricing</h2>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="ticket_price_regular" className="text-sm font-medium">Regular Ticket Price</Label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-muted-foreground sm:text-sm">
                                                {data.currency === 'USD' ? '$' : data.currency === 'EUR' ? '€' : data.currency === 'GBP' ? '£' : ''}
                                            </span>
                                        </div>
                                        <Input
                                            id="ticket_price_regular"
                                            type="number"
                                            step="0.01"
                                            value={data.ticket_price_regular}
                                            onChange={e => setData('ticket_price_regular', e.target.value)}
                                            className="focus:ring-primary focus:border-primary pl-8"
                                        />
                                    </div>
                                    {errors.ticket_price_regular && <p className="text-destructive mt-1 text-sm">{errors.ticket_price_regular}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="ticket_price_vip" className="text-sm font-medium">VIP Ticket Price</Label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-muted-foreground sm:text-sm">
                                                {data.currency === 'USD' ? '$' : data.currency === 'EUR' ? '€' : data.currency === 'GBP' ? '£' : ''}
                                            </span>
                                        </div>
                                        <Input
                                            id="ticket_price_vip"
                                            type="number"
                                            step="0.01"
                                            value={data.ticket_price_vip}
                                            onChange={e => setData('ticket_price_vip', e.target.value)}
                                            className="focus:ring-primary focus:border-primary pl-8"
                                        />
                                    </div>
                                    {errors.ticket_price_vip && <p className="text-destructive mt-1 text-sm">{errors.ticket_price_vip}</p>}
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="flex justify-end"
                    >
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
                        >
                            Save Settings
                        </Button>
                    </motion.div>
                </form>
            </motion.div>
        </AdminLayout>
    );
}
