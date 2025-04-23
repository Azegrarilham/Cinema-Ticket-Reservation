import { TicketIcon, UserIcon, Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

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

interface SearchResult {
    id: number | string;
    title: string;
    subtitle?: string;
    url: string;
    image?: string;
}

const mainNavItems = [
    { name: 'Home', href: '/' },
    { name: 'Films', href: '/films' },
];

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Animation variants
    const navVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0 }
    };

    const logoVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.05, transition: { duration: 0.2 } }
    };

    // Handle search input change
    const handleSearchChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            setIsSearching(true);
            const response = await axios.get('/api/search', { params: { q: query } });
            setSearchResults(response.data.results || []);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Handle search submission
    const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get('/search', { q: searchQuery });
            setSearchOpen(false);
            setSearchQuery('');
            setSearchResults([]);
        }
    };

    return (
        <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
            ? 'bg-black/95 backdrop-blur-md shadow-md border-b border-white/10'
            : 'bg-black/85 border-b border-white/20'
            }`}>
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Brand */}
                    <motion.div
                        className="flex items-center"
                        initial="initial"
                        whileHover="hover"
                        variants={logoVariants}
                    >
                        <Link href="/" className="flex items-center flex-shrink-0">
                            <img className="w-10 h-10" src="/logo.png" alt="CineVerse" />
                            <span className="ml-2 text-xl font-bold tracking-tight text-white">
                                Cine<span className="text-primary">Verse</span>
                            </span>
                        </Link>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <motion.nav
                        className="items-center hidden md:ml-10 md:flex md:space-x-4"
                        aria-label="Main navigation"
                        variants={navVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {mainNavItems.map((item) => (
                            <motion.div key={item.name} variants={itemVariants}>
                                <Link
                                    href={item.href}
                                    className="relative px-3 py-2 text-sm font-medium text-white transition-colors rounded-md group hover:text-primary"
                                >
                                    {item.name}
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                                </Link>
                            </motion.div>
                        ))}

                        <motion.div variants={itemVariants}>
                            <Link
                                href="/find-reservation"
                                className="relative inline-block px-3 py-2 text-sm font-medium transition-colors rounded-md group text-primary hover:text-primary-light"
                            >
                                <span className="flex items-center">
                                    <TicketIcon className="w-4 h-4 mr-1.5" />
                                    Find Reservation
                                </span>
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100 origin-left"></div>
                            </Link>
                        </motion.div>
                    </motion.nav>

                    {/* Desktop user menu and actions */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        {/* Search button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSearchOpen(!searchOpen)}
                            className="p-2 text-white transition-colors rounded-full hover:text-primary hover:bg-white/10"
                            aria-label="Search"
                        >
                            <MagnifyingGlassIcon className="w-5 h-5" />
                        </motion.button>

                        {/* User menu */}
                        {user ? (
                            user.role === 'client' ? (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        href="/account/reservations"
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-secondary hover:bg-secondary/80"
                                    >
                                        <TicketIcon className="w-4 h-4 mr-2" />
                                        My Reservations
                                    </Link>

                                    <div className="relative group">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-secondary hover:bg-secondary/80"
                                        >
                                            <UserIcon className="w-4 h-4 mr-2" />
                                            {user.name}
                                        </motion.button>
                                        <div className="absolute right-0 w-48 mt-2 origin-top-right rounded-md shadow-lg bg-black/95 ring-1 ring-white/20 focus:outline-none transition-all duration-300 opacity-0 invisible transform translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 hover:opacity-100 hover:visible hover:translate-y-0" style={{ transitionDelay: '150ms' }}>
                                            <div className="py-1">
                                                <Link
                                                    href="/account"
                                                    className="block px-4 py-2 text-sm text-white hover:bg-white/10"
                                                >
                                                    Account Settings
                                                </Link>
                                                <Link
                                                    href="/logout"
                                                    method="post"
                                                    as="button"
                                                    className="block w-full px-4 py-2 text-sm text-left text-white hover:bg-white/10"
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
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-primary hover:bg-primary/80"
                                    >
                                        <span className="mr-2">🔐</span>
                                        Admin Panel
                                    </Link>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-secondary hover:bg-secondary/80"
                                    >
                                        Logout
                                    </Link>
                                </div>
                            ) : (
                                // User exists but has no defined role
                                <div className="flex items-center space-x-4">
                                    <motion.div whileHover={{ scale: 1.05 }}>
                                        <Link
                                            href="/client/login"
                                            className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-secondary hover:bg-secondary/80"
                                        >
                                            Login
                                        </Link>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.05 }}>
                                        <Link
                                            href="/client/register"
                                            className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-primary hover:bg-primary/90"
                                        >
                                            Register
                                        </Link>
                                    </motion.div>
                                </div>
                            )
                        ) : (
                            // No user logged in
                            <div className="flex items-center space-x-4">
                                <motion.div whileHover={{ scale: 1.05 }}>
                                    <Link
                                        href="/client/login"
                                        className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-secondary hover:bg-secondary/80"
                                    >
                                        Login
                                    </Link>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }}>
                                    <Link
                                        href="/client/register"
                                        className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-primary hover:bg-primary/90"
                                    >
                                        Register
                                    </Link>
                                </motion.div>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            className="inline-flex items-center justify-center p-2 text-white rounded-md hover:bg-white/10"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <span className="sr-only">Open main menu</span>
                            {mobileMenuOpen ? (
                                <XMarkIcon className="w-6 h-6" aria-hidden="true" />
                            ) : (
                                <Bars3Icon className="w-6 h-6" aria-hidden="true" />
                            )}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Search Overlay */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        className="absolute inset-x-0 z-50 p-4 bg-black/90 backdrop-blur-md"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="max-w-4xl mx-auto">
                            <form onSubmit={handleSearchSubmit}>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search for movies, theaters, showtimes..."
                                        className="w-full py-3 pl-4 pr-10 text-white border rounded-md bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        autoFocus
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                    />
                                    <button
                                        type="submit"
                                        className="absolute inset-y-0 right-0 flex items-center px-4 text-white/70 hover:text-primary"
                                    >
                                        <MagnifyingGlassIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>

                            {/* Search Results */}
                            <div className="mt-3">
                                <AnimatePresence>
                                    {isSearching ? (
                                        <div className="flex items-center justify-center py-4">
                                            <div className="w-5 h-5 border-t-2 border-r-2 rounded-full border-primary animate-spin"></div>
                                            <span className="ml-2 text-sm text-white/70">Searching...</span>
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <motion.div
                                            className="overflow-hidden border rounded-md bg-black/95 border-white/20"
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <div className="overflow-y-auto max-h-64">
                                                {searchResults.map((result) => (
                                                    <Link
                                                        key={result.id}
                                                        href={result.url}
                                                        className="flex items-center px-4 py-3 transition-colors border-b border-white/10 hover:bg-white/10"
                                                        onClick={() => setSearchOpen(false)}
                                                    >
                                                        {result.image && (
                                                            <img src={result.image} alt={result.title} className="object-cover w-12 h-16 rounded" />
                                                        )}
                                                        <div className="ml-3">
                                                            <h4 className="text-sm font-medium text-white">{result.title}</h4>
                                                            {result.subtitle && (
                                                                <p className="text-xs text-white/70">{result.subtitle}</p>
                                                            )}
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ) : searchQuery.length >= 2 ? (
                                        <motion.div
                                            className="px-4 py-3 text-sm text-center text-white/70"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            No results found for "{searchQuery}"
                                        </motion.div>
                                    ) : null}
                                </AnimatePresence>
                            </div>

                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={() => {
                                        setSearchOpen(false);
                                        setSearchQuery('');
                                        setSearchResults([]);
                                    }}
                                    className="text-sm text-white/70 hover:text-primary"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        className="md:hidden"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1 border-b bg-black/95 border-white/20">
                            {mainNavItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block px-3 py-2 text-base font-medium text-white rounded-md hover:bg-white/10 hover:text-primary"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <Link
                                href="/find-reservation"
                                className="flex items-center px-3 py-2 text-base font-medium rounded-md text-primary hover:bg-white/5"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <TicketIcon className="w-5 h-5 mr-2" />
                                Find Reservation
                            </Link>

                            {/* Search in mobile menu */}
                            <div className="relative mt-2">
                                <form onSubmit={handleSearchSubmit}>
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="w-full py-2 pl-4 pr-10 text-white border rounded-md bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                    />
                                    <button
                                        type="submit"
                                        className="absolute inset-y-0 right-0 flex items-center px-4 text-white/70 hover:text-primary"
                                    >
                                        <MagnifyingGlassIcon className="w-5 h-5" />
                                    </button>
                                </form>

                                {/* Mobile Search Results */}
                                {searchResults.length > 0 && searchQuery.length >= 2 && (
                                    <div className="absolute z-50 w-full mt-1 overflow-hidden border rounded-md shadow-lg bg-black/95 border-white/20">
                                        <div className="overflow-y-auto max-h-48">
                                            {searchResults.map((result) => (
                                                <Link
                                                    key={result.id}
                                                    href={result.url}
                                                    className="flex items-center px-3 py-2 transition-colors border-b border-white/10 hover:bg-white/10"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    {result.image && (
                                                        <img src={result.image} alt={result.title} className="object-cover w-8 h-12 rounded" />
                                                    )}
                                                    <div className="ml-2">
                                                        <h4 className="text-xs font-medium text-white">{result.title}</h4>
                                                        {result.subtitle && (
                                                            <p className="text-xs text-white/70">{result.subtitle}</p>
                                                        )}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 pb-3 border-t border-white/20 bg-black/95">
                            {user ? (
                                user.role === 'client' ? (
                                    <div className="px-4 space-y-1">
                                        <div className="py-2">
                                            <div className="text-base font-medium text-white">{user.name}</div>
                                            <div className="text-sm text-white/70">{user.email}</div>
                                        </div>
                                        <Link
                                            href="/account/reservations"
                                            className="block px-3 py-2 text-base font-medium text-white rounded-md hover:bg-white/10"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            My Reservations
                                        </Link>
                                        <Link
                                            href="/account"
                                            className="block px-3 py-2 text-base font-medium text-white rounded-md hover:bg-white/10"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Account Settings
                                        </Link>
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="block w-full px-3 py-2 text-base font-medium text-left text-white rounded-md hover:bg-white/10"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Logout
                                        </Link>
                                    </div>
                                ) : user.role === 'admin' ? (
                                    <div className="px-4 space-y-1">
                                        <div className="py-2">
                                            <div className="text-base font-medium text-white">{user.name}</div>
                                            <div className="text-sm text-white/70">{user.email}</div>
                                        </div>
                                        <Link
                                            href="/admin"
                                            className="block px-3 py-2 text-base font-medium text-white rounded-md hover:bg-white/10"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Admin Panel
                                        </Link>
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="block w-full px-3 py-2 text-base font-medium text-left text-white rounded-md hover:bg-white/10"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Logout
                                        </Link>
                                    </div>
                                ) : (
                                    // User exists but has no defined role
                                    <div className="flex flex-col px-4 space-y-2">
                                        <Link
                                            href="/client/login"
                                            className="block w-full px-4 py-2 text-sm font-medium text-center text-white rounded-md bg-secondary"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href="/client/register"
                                            className="block w-full px-4 py-2 text-sm font-medium text-center text-white rounded-md bg-primary"
                                            onClick={() => setMobileMenuOpen(false)}
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
                                        className="block w-full px-4 py-2 text-sm font-medium text-center text-white rounded-md bg-secondary"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/client/register"
                                        className="block w-full px-4 py-2 text-sm font-medium text-center text-white rounded-md bg-primary"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
