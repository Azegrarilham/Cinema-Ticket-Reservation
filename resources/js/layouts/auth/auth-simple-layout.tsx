import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex flex-col items-center justify-center p-6 bg-background min-h-svh md:p-10">
            <div className="w-full max-w-md">
                <div className="relative z-10 flex flex-col gap-8 p-8 border shadow-2xl bg-card/80 border-border rounded-xl backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                        <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
                            <div className="flex items-center justify-center w-16 h-16 mb-1">
                                <img className="w-16 h-16" src="/logo.png" alt="Cinema Logo" />
                            </div>
                            <span className="text-xl font-bold text-foreground">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <p className="text-sm text-center text-muted-foreground">{description}</p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 left-0 right-0 pointer-events-none bg-primary/4 from-primary/10 h-96 bg-gradient-to-b to-transparent"></div>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute rounded-full bg-primary/10 -top-40 -right-40 h-80 w-80 blur-3xl"></div>
                <div className="absolute rounded-full bg-primary/10 -bottom-40 -left-40 h-80 w-80 blur-3xl"></div>
            </div>
        </div>
    );
}
