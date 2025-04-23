import ArrowLeftOnRectangleIcon from '@heroicons/react/24/outline/ArrowLeftOnRectangleIcon.js';
import Bars3Icon from '@heroicons/react/24/outline/Bars3Icon.js';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon.js';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon.js';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon.js';
import CogIcon from '@heroicons/react/24/outline/CogIcon.js';
import FilmIcon from '@heroicons/react/24/outline/FilmIcon.js';
import HomeIcon from '@heroicons/react/24/outline/HomeIcon.js';
import MoonIcon from '@heroicons/react/24/outline/MoonIcon.js';
import SunIcon from '@heroicons/react/24/outline/SunIcon.js';
import TicketIcon from '@heroicons/react/24/outline/TicketIcon.js';
import UserIcon from '@heroicons/react/24/outline/UserIcon.js';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon.js';
import { Link, usePage, router } from '@inertiajs/react';
import { Clapperboard, Sparkles } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import axios from 'axios';

// Add motion for animations
import { motion } from 'framer-motion';
import MotionLink from '@/components/ui/motion-link';

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
    const [theme, setTheme] = useState('dark');
    const [loaded, setLoaded] = useState(false);

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
                    // Auth refresh attempt returned no valid user
                }
            } catch (error) {
                console.error('Error refreshing auth:', error);
            } finally {
                setRefreshingAuth(false);
            }
        } else if (refreshAttempts >= 3) {
            // Max refresh attempts reached, using fallback "Admin" name
        }
    };

    // Try to refresh auth on initial load if name is missing
    useEffect(() => {
        if (!hasValidUserName && refreshAttempts === 0) {
            refreshAuthData();
        }
    }, [hasValidUserName, refreshAttempts]);

    // Toggle theme function
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        localStorage.setItem('adminTheme', newTheme);
    };

    // Initialize theme from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('adminTheme') || 'dark';
        setTheme(savedTheme);

        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Set loaded to true after a small delay to allow for animations
        setTimeout(() => setLoaded(true), 300);
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
                <MotionLink href="/admin" className="transition-colors hover:text-primary">
                    Admin
                </MotionLink>
                {paths.slice(1).map((path, index) => (
                    <div key={path} className="flex items-center">
                        <span className="mx-2">/</span>
                        {index === paths.slice(1).length - 1 ? (
                            <span className="font-medium capitalize text-foreground">{path}</span>
                        ) : (
                            <MotionLink href={`/admin/${paths.slice(1, index + 2).join('/')}`} className="capitalize transition-colors hover:text-primary">
                                {path}
                            </MotionLink>
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
        <div className={`min-h-screen bg-background text-foreground transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-50 flex md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                ></motion.div>

                <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="relative flex flex-col flex-1 w-full max-w-xs pt-5 pb-4 shadow-xl bg-sidebar"
                >
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
                            <div className="flex items-center justify-center rounded-lg w-9 h-9 bg-primary/90 shadow-glow">
                                <img src="/logo.png" alt="Logo" className="w-6 h-6" />
                            </div>
                            <h1 className="text-xl font-bold text-sidebar-foreground">
                                Cinema<span className="text-primary">Admin</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex-1 h-0 mt-6 overflow-y-auto">
                        <nav className="px-3 space-y-1">
                            {navigationItems.map((item, index) => {
                                const isActive = isNavItemActive(item.href);
                                return (
                                    <motion.div
                                        key={item.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <MotionLink
                                            href={item.href}
                                            className={`group flex items-center rounded-md px-3 py-2.5 text-base font-medium transition-all ${isActive
                                                ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                                                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                                }`}
                                        >
                                            <item.icon
                                                className={`mr-4 h-5 w-5 flex-shrink-0 transition-all ${isActive
                                                    ? 'text-sidebar-primary-foreground'
                                                    : 'text-muted-foreground group-hover:text-sidebar-accent-foreground'
                                                    }`}
                                                aria-hidden="true"
                                            />
                                            {item.name}
                                        </MotionLink>
                                    </motion.div>
                                );
                            })}
                        </nav>
                    </div>
                </motion.div>
            </div>

            {/* Static sidebar for desktop */}
            <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
                <div className="flex flex-col flex-grow h-full pt-5 overflow-y-auto bg-sidebar">
                    <div className="flex items-center flex-shrink-0 px-6 mb-8">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center rounded-lg w-9 h-9 bg-primary/90 shadow-glow">
                                <img src="/logo.png" alt="Logo" className="w-6 h-6" />
                            </div>
                            <h1 className="text-xl font-bold text-sidebar-foreground">
                                Cine<span className="text-primary">Admin</span>
                            </h1>
                        </div>
                    </div>

                    <div className="px-4 mb-2">
                        <h2 className="px-3 text-xs font-semibold tracking-wider uppercase text-muted-foreground">Main Menu</h2>
                    </div>

                    <div className="flex flex-col flex-grow mt-2">
                        <nav className="flex-1 px-3 pb-4 space-y-1">
                            {navigationItems.map((item, index) => {
                                const isActive = isNavItemActive(item.href);
                                return (
                                    <motion.div
                                        key={item.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <MotionLink
                                            href={item.href}
                                            className={`group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all ${isActive
                                                ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                                                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                                }`}
                                        >
                                            <item.icon
                                                className={`mr-3 h-5 w-5 flex-shrink-0 transition-all duration-200 group-hover:scale-110 ${isActive
                                                    ? 'text-sidebar-primary-foreground'
                                                    : 'text-muted-foreground group-hover:text-sidebar-accent-foreground'
                                                    }`}
                                                aria-hidden="true"
                                            />
                                            {item.name}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeIndicator"
                                                    className="absolute left-0 w-1 h-5 ml-0.5 rounded-r-full bg-primary"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                />
                                            )}
                                        </MotionLink>
                                    </motion.div>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-4 mt-auto">
                        <div className="p-3 rounded-lg bg-sidebar-accent/50">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-yellow-300" />
                                <div className="text-xs font-medium text-sidebar-foreground">Admin Panel v2.0</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col flex-1 md:pl-64">
                <div
                    className={`sticky top-0 z-10 flex h-16 flex-shrink-0 ${isScrolled ? 'shadow-lg backdrop-blur-sm bg-card/90' : 'shadow-md bg-card'} transition-all duration-200`}
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
                            {/* Theme toggle button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleTheme}
                                className="flex items-center justify-center transition-colors rounded-full w-9 h-9 text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                            >
                                <motion.div
                                    initial={false}
                                    animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                                    transition={{ duration: 0.5, type: "spring" }}
                                >
                                    {theme === 'dark' ? (
                                        <SunIcon className="w-5 h-5" />
                                    ) : (
                                        <MoonIcon className="w-5 h-5" />
                                    )}
                                </motion.div>
                                <span className="sr-only">
                                    {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                                </span>
                            </motion.button>

                            {/* User profile dropdown - improved styling */}
                            <div className="relative">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleProfileClick}
                                    className="flex items-center gap-2 text-sm transition-opacity rounded-md hover:opacity-80 focus:outline-none"
                                    aria-expanded={isProfileOpen}
                                    aria-haspopup="true"
                                >
                                    <div className="flex items-center justify-center rounded-full w-9 h-9 bg-primary/10 ring-2 ring-primary/30">
                                        <span className="text-sm font-medium text-foreground">{userInitial}</span>
                                    </div>
                                    <span className="hidden text-sm font-medium text-foreground md:block">{displayName}</span>
                                    <motion.div
                                        animate={{ rotate: isProfileOpen ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ChevronDownIcon className="hidden w-4 h-4 text-muted-foreground md:block" />
                                    </motion.div>
                                </motion.button>

                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 z-10 w-48 mt-2 overflow-hidden origin-top-right border rounded-md shadow-lg border-border bg-popover"
                                    >
                                        <div className="py-1">
                                            <MotionLink
                                                href="/admin/profile"
                                                className="flex items-center px-4 py-2 text-sm transition-colors text-popover-foreground hover:bg-accent/80"
                                            >
                                                <UserIcon className="w-4 h-4 mr-3 text-muted-foreground" />
                                                Your Profile
                                            </MotionLink>
                                            <MotionLink
                                                href="/admin/settings"
                                                className="flex items-center px-4 py-2 text-sm transition-colors text-popover-foreground hover:bg-accent/80"
                                            >
                                                <CogIcon className="w-4 h-4 mr-3 text-muted-foreground" />
                                                Settings
                                            </MotionLink>
                                            <div className="my-1 border-t border-border"></div>
                                            <MotionLink
                                                href={route('admin.logout')}
                                                className="flex items-center w-full px-4 py-2 text-sm transition-colors text-popover-foreground hover:bg-accent/80"
                                                method="post"
                                                as="button"
                                            >
                                                <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-3 text-muted-foreground" />
                                                Sign out
                                            </MotionLink>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <main className="flex-1 bg-background">
                    {/* Page header with improved film strip design */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative px-4 py-5 m-3 overflow-hidden border rounded-lg bg-card sm:px-6 md:px-8 border-border/50"
                    >
                        {generateBreadcrumbs()}
                        <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center">
                                <motion.div
                                    whileHover={{ rotate: 10 }}
                                    className="flex items-center justify-center p-2 mr-3 rounded-lg bg-primary/10"
                                >
                                    <Clapperboard className="w-6 h-6 text-primary" />
                                </motion.div>
                                <div>
                                    <h1 className="flex items-center text-2xl font-bold tracking-tight text-foreground">
                                        {title}
                                    </h1>
                                    {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Decorative film strip */}
                        <div className="absolute right-0 -top-6 opacity-5 rotate-12">
                            <div className="flex items-center">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="w-12 h-16 mx-0.5 border-2 border-foreground"></div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="p-4 md:p-8"
                    >
                        {/* Content wrapper with improved shadow and rounded corners */}
                        <div className="p-6 rounded-lg shadow-lg bg-card sm:p-6 md:p-8 ring-1 ring-black/5">{children}</div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
