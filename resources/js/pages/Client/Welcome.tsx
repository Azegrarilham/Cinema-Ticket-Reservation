import ClientLayout from '@/layouts/ClientLayout';
import { Head } from '@inertiajs/react';
import HeroSection from '@/components/welcome/HeroSection';
import FeaturedFilmsSection from '@/components/welcome/FeaturedFilmsSection';
import LatestFilmsSection from '@/components/welcome/LatestFilmsSection';
import UpcomingMoviesSection from '@/components/welcome/UpcomingMoviesSection';
import CinemaExperienceSection from '@/components/welcome/CinemaExperienceSection';
import CinemaLocationsSection from '@/components/welcome/CinemaLocationsSection';
import CtaSection from '@/components/welcome/CtaSection';

interface Film {
    id: number;
    title: string;
    description: string;
    poster_image: string | null;
    genre: string | null;
    duration: number;
    director: string | null;
}

interface WelcomeProps {
    featuredFilms: Film[];
    latestFilms: Film[];
}

export default function Welcome({ featuredFilms, latestFilms }: WelcomeProps) {
    return (
        <ClientLayout>
            <Head title="CineVerse - Immersive Movie Experience" />

            <HeroSection />

            <div style={{ background: 'linear-gradient(to bottom, #000203, #01080c)' }}>
                <FeaturedFilmsSection featuredFilms={featuredFilms} />
                <LatestFilmsSection latestFilms={latestFilms} />
                <UpcomingMoviesSection />
                <CinemaExperienceSection />
                <CinemaLocationsSection />
            </div>
            <CtaSection />
        </ClientLayout>
    );
}
