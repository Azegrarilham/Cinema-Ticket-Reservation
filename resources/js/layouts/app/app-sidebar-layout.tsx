import React, { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

interface AppSidebarLayoutProps {
    sidebar?: React.ReactNode;
    className?: string;
}

export default function AppSidebarLayout({
    children,
    sidebar,
    className
}: PropsWithChildren<AppSidebarLayoutProps>) {
    return (
        <div className={cn('flex min-h-screen bg-background', className)}>
            {/* Sidebar */}
            {sidebar && (
                <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:w-64 lg:pb-4 border-r bg-card border-border">
                    {sidebar}
                </div>
            )}

            {/* Main content area */}
            <div className="flex flex-col flex-1 lg:pl-64">
                {/* Main content */}
                <main className="flex-1">{children}</main>
            </div>
        </div>
    );
}
