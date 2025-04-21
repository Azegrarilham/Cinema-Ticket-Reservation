import ArrowLeftOnRectangleIcon from '@heroicons/react/24/outline/ArrowLeftOnRectangleIcon.js';
import Bars3Icon from '@heroicons/react/24/outline/Bars3Icon.js';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon.js';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon.js';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon.js';
import CogIcon from '@heroicons/react/24/outline/CogIcon.js';
import FilmIcon from '@heroicons/react/24/outline/FilmIcon.js';
import HomeIcon from '@heroicons/react/24/outline/HomeIcon.js';
import StarIcon from '@heroicons/react/24/outline/StarIcon.js';
import TicketIcon from '@heroicons/react/24/outline/TicketIcon.js';
import UserIcon from '@heroicons/react/24/outline/UserIcon.js';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon.js';
import { Link, usePage, router } from '@inertiajs/react';
import { PopcornIcon } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import axios from 'axios';

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
}

interface User {
    id?: number;
    name?: string;
    email?: string;
    role?: string;
    [key: string]: unknown;
}

interface AuthData {
    user: User | null;
}

interface PageProps {
    auth?: AuthData;
    [key: string]: unknown;
}

export default function AdminLayout({ children, title = 'Dashboard', subtitle }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [refreshingAuth, setRefreshingAuth] = useState(false);
    const [refreshAttempts, setRefreshAttempts] = useState(0);

    // Get authenticated user from page props - handle different possible structures safely
    const pageProps = usePage().props as PageProps;
    const auth = pageProps.auth as AuthData | undefined;

    // Use optional chaining to safely access nested properties
    const user = auth?.user || null;

    // Check if we should try to refresh auth data
    const hasValidUserName = user?.name && typeof user.name === 'string' && user.name.trim() !== '';

    // Function to manually refresh auth data if needed
    const refreshAuthData = async () => {
        // Only refresh if we need to and aren't already refreshing
        // And limit to max 3 attempts to prevent infinite loops
        if (!hasValidUserName && !refreshingAuth && refreshAttempts < 3) {
            try {
                setRefreshingAuth(true);
                setRefreshAttempts(prev => prev + 1);

                // Try to fetch current auth state from the special debug endpoint
                const response = await axios.get('/api/auth-check', {
                    // Add cache-busting parameter
                    params: { _t: new Date().getTime() }
                });


                if (response.data.authenticated && response.data.user?.name) {
                    // Force a reload of the current page to refresh auth data
                    // Only reload if we have a valid user
                    router.reload();
                } else {
                    console.log('Auth refresh attempt returned no valid user:', response.data);
                }
            } catch (error) {
                console.error('Error refreshing auth:', error);
            } finally {
                setRefreshingAuth(false);
            }
        } else if (refreshAttempts >= 3) {
            console.log('Max refresh attempts reached, using fallback "Admin" name');
        }
    };

    // Try to refresh auth on initial load if name is missing
    useEffect(() => {
        if (!hasValidUserName && refreshAttempts === 0) {
            console.log('Missing valid user name, attempting refresh...');
            refreshAuthData();
        }
    }, [hasValidUserName, refreshAttempts]);

    // Log auth data for debugging
    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') {
            console.log('Page props:', pageProps);
            console.log('Auth data:', auth);
            console.log('User data:', user);
            console.log('Has valid name:', hasValidUserName);
            console.log('Refresh attempts:', refreshAttempts);
        }
    }, [pageProps, auth, user, hasValidUserName, refreshAttempts]);

    // Always use dark mode
    useEffect(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
    }, []);

    // Add scroll listener for header shadow
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Get current page for nav highlighting
    const currentPath = window.location.pathname;

    const navigationItems = [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Films', href: '/admin/films', icon: FilmIcon },
        { name: 'Screenings', href: '/admin/screenings', icon: CalendarIcon },
        { name: 'Reservations', href: '/admin/reservations', icon: TicketIcon },
        { name: 'Reports', href: '/admin/reports/films', icon: ChartBarIcon },
    ];

    // Function to generate breadcrumbs
    const generateBreadcrumbs = () => {
        const paths = currentPath.split('/').filter(Boolean);

        // Return nothing for root admin path
        if (paths.length <= 1) return null;

        return (
            <div className="flex mb-2 text-sm text-muted-foreground">
                <Link href="/admin" className="transition-colors hover:text-primary">
                    Admin
                </Link>
                {paths.slice(1).map((path, index) => (
                    <div key={path} className="flex items-center">
                        <span className="mx-2">/</span>
                        {index === paths.slice(1).length - 1 ? (
                            <span className="font-medium capitalize text-foreground">{path}</span>
                        ) : (
                            <Link href={`/admin/${paths.slice(1, index + 2).join('/')}`} className="capitalize transition-colors hover:text-primary">
                                {path}
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const handleProfileClick = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    // Get the first letter of the user's name for the avatar - safely check all possible formats
    const getUserInitial = () => {
        if (user && typeof user === 'object') {
            // Try to get name directly from user object
            if (user.name && typeof user.name === 'string' && user.name.length > 0) {
                return user.name.charAt(0).toUpperCase();
            }
        }
        return 'A'; // Generic fallback
    };

    const userInitial = getUserInitial();

    // Get display name with better fallback handling
    const getDisplayName = () => {
        if (user && typeof user === 'object') {
            // Try to get name directly from user object
            if (user.name && typeof user.name === 'string' && user.name.trim() !== '') {
                return user.name;
            }
        }
        return 'Admin'; // Generic fallback
    };

    const displayName = getDisplayName();

    // Function to determine if a navigation item is active
    const isNavItemActive = (href: string): boolean => {
        // For the dashboard, only match exact /admin path
        if (href === '/admin') {
            return currentPath === '/admin';
        }

        // For other items, check if the path starts with their href and is not just /admin
        return currentPath.startsWith(href) && currentPath !== '/admin';
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-50 flex md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} aria-hidden="true"></div>

                <div className="relative flex flex-col flex-1 w-full max-w-xs pt-5 pb-4 transition-transform duration-200 ease-in-out transform shadow-xl bg-sidebar">
                    <div className="absolute top-0 right-0 pt-2 -mr-12">
                        <button
                            className="flex items-center justify-center w-10 h-10 ml-1 rounded-full bg-sidebar-accent focus:ring-primary focus:ring-2 focus:outline-none"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="sr-only">Close sidebar</span>
                            <XMarkIcon className="w-6 h-6 text-sidebar-foreground" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="flex items-center flex-shrink-0 px-4">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
                                <img src="/logo.png" alt="Logo" className="w-5 h-5" />
                            </div>
                            <h1 className="text-xl font-bold text-sidebar-foreground">CinemaAdmin</h1>
                        </div>
                    </div>

                    <div className="flex-1 h-0 mt-6 overflow-y-auto">
                        <nav className="px-3 space-y-1">
                            {navigationItems.map((item) => {
                                const isActive = isNavItemActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`group flex items-center rounded-md px-3 py-2.5 text-base font-medium transition-colors ${isActive
                                            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                            }`}
                                    >
                                        <item.icon
                                            className={`mr-4 h-5 w-5 flex-shrink-0 ${isActive
                                                ? 'text-sidebar-primary-foreground'
                                                : 'text-muted-foreground group-hover:text-sidebar-accent-foreground'
                                                }`}
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Now Showing Section */}
                    <div className="p-3 mx-3 mt-8 rounded-lg shadow-inner bg-sidebar-accent">
                        <h3 className="flex items-center mb-3 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                            <StarIcon className="mr-1 h-3.5 w-3.5 text-yellow-500" />
                            Now Showing
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <div className="w-2 h-2 mr-2 rounded-full bg-success"></div>
                                <span className="text-xs text-sidebar-foreground">Oppenheimer</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-2 h-2 mr-2 rounded-full bg-success"></div>
                                <span className="text-xs text-sidebar-foreground">Dune 2</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-2 h-2 mr-2 rounded-full bg-destructive"></div>
                                <span className="text-xs text-sidebar-foreground">Inside Out 2</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Static sidebar for desktop */}
            <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
                <div className="flex flex-col flex-grow h-full pt-5 overflow-y-auto bg-sidebar">
                    <div className="flex items-center flex-shrink-0 px-6 mb-8">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
                                <img src="/logo.png" alt="Logo" className="w-5 h-5" />
                            </div>
                            <h1 className="text-xl font-bold text-sidebar-foreground">CinemaAdmin</h1>
                        </div>
                    </div>

                    <div className="px-4 mb-2">
                        <h2 className="px-3 text-xs font-semibold tracking-wider uppercase text-muted-foreground">Main Menu</h2>
                    </div>

                    <div className="flex flex-col flex-grow mt-2">
                        <nav className="flex-1 px-3 pb-4 space-y-1">
                            {navigationItems.map((item) => {
                                const isActive = isNavItemActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all ${isActive
                                            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                            }`}
                                    >
                                        <item.icon
                                            className={`mr-3 h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive
                                                ? 'text-sidebar-primary-foreground'
                                                : 'text-muted-foreground group-hover:text-sidebar-accent-foreground'
                                                }`}
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Now Showing Section */}
                    <div className="p-3 mx-3 mt-auto mb-6 rounded-lg shadow-inner bg-sidebar-accent">
                        <h3 className="flex items-center mb-3 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                            <StarIcon className="mr-1 h-3.5 w-3.5 text-yellow-500" />
                            Now Showing
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <div className="w-2 h-2 mr-2 rounded-full bg-success"></div>
                                <span className="text-xs text-sidebar-foreground">Oppenheimer</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-2 h-2 mr-2 rounded-full bg-success"></div>
                                <span className="text-xs text-sidebar-foreground">Dune 2</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-2 h-2 mr-2 rounded-full bg-destructive"></div>
                                <span className="text-xs text-sidebar-foreground">Inside Out 2</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col flex-1 md:pl-64">
                <div
                    className={`sticky top-0 z-10 flex h-16 flex-shrink-0 ${isScrolled ? 'shadow-lg' : 'shadow-md'} bg-card transition-shadow duration-200`}
                >
                    <button
                        type="button"
                        className="px-4 border-r border-border text-muted-foreground hover:text-foreground focus:ring-primary focus:ring-2 focus:outline-none focus:ring-inset md:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <Bars3Icon className="w-6 h-6" aria-hidden="true" />
                    </button>

                    <div className="flex justify-between flex-1 px-4">
                        <div className="flex items-center flex-1">
                            {/* Page title for mobile */}
                            <h1 className="text-lg font-medium text-foreground md:hidden">{title}</h1>
                        </div>

                        <div className="flex items-center gap-5 ml-4 md:ml-6">
                            {/* User profile dropdown - improved styling */}
                            <div className="relative">
                                <button
                                    onClick={handleProfileClick}
                                    className="flex items-center gap-2 text-sm transition-opacity rounded-md hover:opacity-80 focus:outline-none"
                                    aria-expanded={isProfileOpen}
                                    aria-haspopup="true"
                                >
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 border-primary border-1">
                                        <span className="text-sm font-medium text-foreground">{userInitial}</span>
                                    </div>
                                    <span className="hidden text-sm font-medium text-foreground md:block">{displayName}</span>
                                    <ChevronDownIcon
                                        className={`text-muted-foreground hidden h-4 w-4 transition-transform duration-200 md:block ${isProfileOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 z-10 w-48 mt-2 overflow-hidden transition-all duration-200 ease-out origin-top-right transform border rounded-md shadow-lg border-border bg-popover">
                                        <div className="py-1">
                                            <Link
                                                href="/admin/profile"
                                                className="flex items-center px-4 py-2 text-sm transition-colors text-popover-foreground hover:bg-accent/80"
                                            >
                                                <UserIcon className="w-4 h-4 mr-3 text-muted-foreground" />
                                                Your Profile
                                            </Link>
                                            <Link
                                                href="/admin/settings"
                                                className="flex items-center px-4 py-2 text-sm transition-colors text-popover-foreground hover:bg-accent/80"
                                            >
                                                <CogIcon className="w-4 h-4 mr-3 text-muted-foreground" />
                                                Settings
                                            </Link>
                                            <div className="my-1 border-t border-border"></div>
                                            <Link
                                                href={route('admin.logout')}
                                                method="post"
                                                as="button"
                                                className="flex items-center w-full px-4 py-2 text-sm transition-colors text-popover-foreground hover:bg-accent/80"
                                            >
                                                <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-3 text-muted-foreground" />
                                                Sign out
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <main className="flex-1 border bg-background">
                    {/* Page header with improved film strip design */}
                    <div className="relative px-4 py-4 m-1 overflow-hidden bg-card sm:px-6 md:px-8">
                        {generateBreadcrumbs()}
                        <div className="flex items-center justify-between mt-1">
                            <div>
                                <h1 className="flex items-center text-2xl font-bold tracking-tight text-foreground">
                                    <PopcornIcon className="w-6 h-6 mr-2 text-yellow-200" />
                                    {title}
                                </h1>
                                {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 md:p-8">
                        {/* Content wrapper with improved shadow and rounded corners */}
                        <div className="px-4 py-6 rounded-lg shadow-lg bg-card ring-1 ring-black/5 sm:p-6 md:p-8">{children}</div>
                    </div>
                </main>
            </div>
        </div>
    );
}
