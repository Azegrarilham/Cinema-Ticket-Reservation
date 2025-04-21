import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-medium">Appearance settings</h3>
                        <p className="text-sm text-muted-foreground">Update your account's appearance settings</p>
                    </div>
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
