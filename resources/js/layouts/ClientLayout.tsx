import { ReactNode, useEffect } from 'react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

interface ClientLayoutProps {
    children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    // Set dark mode by default
    useEffect(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
    }, []);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <Header />

            {/* Main content */}
            <main>{children}</main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
