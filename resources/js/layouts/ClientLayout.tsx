import { TicketIcon, UserIcon } from '@heroicons/react/24/outline';
import { Link, usePage } from '@inertiajs/react';
import { ReactNode, useEffect, useState } from 'react';

interface ClientLayoutProps {
    children: ReactNode;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface PageProps {
    auth: {
        user: User | null;
    };
    [key: string]: unknown;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;


    const navigationItems = [
        { name: 'Home', href: '/' },
        { name: 'Films', href: '/films' },
    ];

    // Set dark mode by default
    useEffect(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
    }, []);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-background/80 border-border backdrop-blur-sm">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center flex-shrink-0">
                                {/* <FilmIcon className="w-8 h-8 text-primary" /> */}
                                <img className="w-10 h-10" src="/logo.png" alt="" />
                                <span className="ml-2 text-xl font-bold text-foreground">CineVerse</span>
                            </Link>
                            <nav className="hidden sm:ml-10 sm:flex sm:space-x-4" aria-label="Main navigation">
                                {navigationItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="px-3 py-2 text-sm font-medium transition-colors rounded-md text-foreground hover:bg-secondary hover:text-foreground"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                <Link
                                    href="/find-reservation"
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium transition-colors rounded-md bg-primary/10 text-primary hover:bg-primary/20"
                                >
                                    <TicketIcon className="w-4 h-4 mr-1.5" />
                                    Find Reservation
                                </Link>
                            </nav>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:space-x-4">
                            {user ? (
                                user.role === 'client' ? (
                                    <div className="flex items-center space-x-4">
                                        <Link
                                            href="/account/reservations"
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                        >
                                            <TicketIcon className="w-4 h-4 mr-2" />
                                            My Reservations
                                        </Link>

                                        <div className="relative group">
                                            <button className="inline-flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                <UserIcon className="w-4 h-4 mr-2" />
                                                {user.name}
                                            </button>
                                            <div className="absolute right-0 hidden w-48 mt-2 origin-top-right rounded-md shadow-lg bg-popover ring-border ring-1 group-hover:block focus:outline-none">
                                                <div className="py-1">
                                                    <Link
                                                        href="/account"
                                                        className="block px-4 py-2 text-sm text-popover-foreground hover:bg-secondary"
                                                    >
                                                        Account Settings
                                                    </Link>
                                                    <Link
                                                        href="/logout"
                                                        method="post"
                                                        as="button"
                                                        className="block w-full px-4 py-2 text-sm text-left text-popover-foreground hover:bg-secondary"
                                                    >
                                                        Logout
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : user.role === 'admin' ? (
                                    <div className="flex items-center space-x-4">
                                        <Link
                                            href="/admin"
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-md bg-primary text-primary-foreground hover:bg-primary/80"
                                        >
                                            <span className="mr-2">🔐</span>
                                            Admin Panel
                                        </Link>
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                        >
                                            Logout
                                        </Link>
                                    </div>
                                ) : (
                                    // User exists but has no defined role
                                    <div className="flex items-center space-x-4">
                                        <Link
                                            href="/client/login"
                                            className="px-4 py-2 text-sm font-medium transition-colors rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href="/client/register"
                                            className="px-4 py-2 text-sm font-medium transition-colors rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                                        >
                                            Register
                                        </Link>
                                    </div>
                                )
                            ) : (
                                // No user logged in
                                <div className="flex items-center space-x-4">
                                    <Link
                                        href="/client/login"
                                        className="px-4 py-2 text-sm font-medium transition-colors rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/client/register"
                                        className="px-4 py-2 text-sm font-medium transition-colors rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center sm:hidden">
                            <button
                                type="button"
                                className="inline-flex items-center justify-center p-2 rounded-md text-secondary-foreground hover:bg-secondary"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                <span className="sr-only">Open main menu</span>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    {mobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className={`sm:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="block px-3 py-2 text-base font-medium rounded-md text-foreground hover:bg-secondary"
                            >
                                {item.name}
                            </Link>
                        ))}
                        <Link
                            href="/find-reservation"
                            className="flex items-center px-3 py-2 text-base font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20"
                        >
                            <TicketIcon className="w-5 h-5 mr-2" />
                            Find Reservation
                        </Link>
                    </div>

                    <div className="pt-4 pb-3 border-t border-border">
                        {user ? (
                            user.role === 'client' ? (
                                <div className="px-4 space-y-1">
                                    <div className="py-2">
                                        <div className="text-base font-medium text-foreground">{user.name}</div>
                                        <div className="text-sm text-muted-foreground">{user.email}</div>
                                    </div>
                                    <Link
                                        href="/account/reservations"
                                        className="block px-3 py-2 text-base font-medium rounded-md text-foreground hover:bg-secondary"
                                    >
                                        My Reservations
                                    </Link>
                                    <Link
                                        href="/account"
                                        className="block px-3 py-2 text-base font-medium rounded-md text-foreground hover:bg-secondary"
                                    >
                                        Account Settings
                                    </Link>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="block w-full px-3 py-2 text-base font-medium text-left rounded-md text-foreground hover:bg-secondary"
                                    >
                                        Logout
                                    </Link>
                                </div>
                            ) : user.role === 'admin' ? (
                                <div className="px-4 space-y-1">
                                    <div className="py-2">
                                        <div className="text-base font-medium text-foreground">{user.name}</div>
                                        <div className="text-sm text-muted-foreground">{user.email}</div>
                                    </div>
                                    <Link
                                        href="/admin"
                                        className="block px-3 py-2 text-base font-medium rounded-md text-foreground hover:bg-secondary"
                                    >
                                        Admin Panel
                                    </Link>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="block w-full px-3 py-2 text-base font-medium text-left rounded-md text-foreground hover:bg-secondary"
                                    >
                                        Logout
                                    </Link>
                                </div>
                            ) : (
                                // User exists but has no defined role
                                <div className="flex flex-col px-4 space-y-2">
                                    <Link
                                        href="/client/login"
                                        className="block w-full px-4 py-2 text-sm font-medium text-center rounded-md bg-secondary text-secondary-foreground"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/client/register"
                                        className="block w-full px-4 py-2 text-sm font-medium text-center rounded-md bg-primary text-primary-foreground"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )
                        ) : (
                            // No user logged in
                            <div className="flex flex-col px-4 space-y-2">
                                <Link
                                    href="/client/login"
                                    className="block w-full px-4 py-2 text-sm font-medium text-center rounded-md bg-secondary text-secondary-foreground"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/client/register"
                                    className="block w-full px-4 py-2 text-sm font-medium text-center rounded-md bg-primary text-primary-foreground"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main>{children}</main>

            {/* Footer */}
            <footer className="bg-black border-t border-border">
                <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <p className="text-sm text-center text-muted-foreground">
                        &copy; {new Date().getFullYear()} Cinema Experience. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
