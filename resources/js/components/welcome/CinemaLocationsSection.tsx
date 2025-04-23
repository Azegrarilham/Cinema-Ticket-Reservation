import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CINEMA_LOCATIONS, CinemaLocation } from '@/data/cinemaLocations';

const CinemaLocationsSection = () => {
    const [selectedCinema, setSelectedCinema] = useState<CinemaLocation | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    const [sectionRef, inView] = useInView({
        triggerOnce: false,
        threshold: 0.1,
    });

    // Fix Leaflet icon issue
    useEffect(() => {
        // Fix Leaflet's default icon issues
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        });

        // Set map loaded after a short delay
        const timer = setTimeout(() => {
            setMapLoaded(true);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
            },
        },
    };

    return (
        <section ref={sectionRef} id="locations" className="py-16 md:py-24 bg-black/80">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex items-center mb-8 md:mb-12">
                    <div className="w-12 h-1 mr-4 rounded-full bg-primary" />
                    <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">Our Theaters</h2>
                </div>

                <p className="max-w-3xl mb-10 text-lg text-white/80">
                    Find your nearest CineVerse location in Rabat, Morocco and experience the ultimate in film entertainment.
                    Each of our theaters offers state-of-the-art technology and premium amenities.
                </p>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
                    {/* Cinema List */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate={inView ? "visible" : "hidden"}
                        className="lg:col-span-1"
                    >
                        <div className="p-1 overflow-hidden rounded-lg bg-white/5">
                            <div className="px-3 py-4 border-b border-white/10">
                                <h3 className="text-lg font-medium text-white">Select a Location</h3>
                            </div>
                            <div className="space-y-1 overflow-y-auto max-h-[500px] custom-scrollbar">
                                {CINEMA_LOCATIONS.map((cinema) => (
                                    <motion.button
                                        key={cinema.id}
                                        variants={itemVariants}
                                        className={`w-full px-4 py-3 text-left transition-colors rounded-md hover:bg-white/10 ${selectedCinema?.id === cinema.id ? 'bg-primary/20 hover:bg-primary/30' : ''
                                            }`}
                                        onClick={() => setSelectedCinema(cinema)}
                                    >
                                        <h4 className="text-base font-medium text-white">{cinema.name}</h4>
                                        <p className="text-sm text-white/60">{cinema.address}</p>
                                        <div className="flex flex-wrap mt-1 space-x-1">
                                            {cinema.facilities.slice(0, 2).map((facility, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-block px-2 py-0.5 text-xs rounded-full bg-white/10 text-white/70"
                                                >
                                                    {facility}
                                                </span>
                                            ))}
                                            {cinema.facilities.length > 2 && (
                                                <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-white/10 text-white/70">
                                                    +{cinema.facilities.length - 2} more
                                                </span>
                                            )}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Map View */}
                    <div className="lg:col-span-2">
                        <div className="relative overflow-hidden rounded-lg shadow-lg h-[500px]">
                            {!mapLoaded && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
                                    <div className="w-12 h-12 border-4 border-t-primary border-white/20 rounded-full animate-spin" />
                                </div>
                            )}
                            <MapContainer
                                center={selectedCinema ? selectedCinema.position : [33.9715, -6.8498]} // Rabat center coordinates
                                zoom={selectedCinema ? 14 : 12}
                                className="h-full w-full z-0"
                                whenReady={() => setMapLoaded(true)}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {CINEMA_LOCATIONS.map((cinema) => (
                                    <Marker
                                        key={cinema.id}
                                        position={cinema.position}
                                        eventHandlers={{
                                            click: () => {
                                                setSelectedCinema(cinema);
                                            },
                                        }}
                                    >
                                        <Popup>
                                            <div className="p-2">
                                                <h3 className="text-base font-medium">{cinema.name}</h3>
                                                <p className="text-sm text-gray-600">{cinema.address}</p>
                                                <p className="text-sm text-gray-600">{cinema.city}, Morocco</p>
                                                <p className="mt-1 text-sm">
                                                    <span className="font-medium">{cinema.screens}</span> screens
                                                </p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    </div>
                </div>

                {/* Cinema Details */}
                {selectedCinema && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="p-6 mt-8 overflow-hidden rounded-lg bg-white/5"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">{selectedCinema.name}</h3>
                                <p className="mt-1 text-white/80">
                                    {selectedCinema.address}, {selectedCinema.city}, Morocco
                                </p>
                                <p className="mt-1 text-white/60">
                                    {selectedCinema.screens} screens with premium viewing experiences
                                </p>
                            </div>
                            <a
                                href={`https://maps.google.com/?q=${selectedCinema.position[0]},${selectedCinema.position[1]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-2 text-sm font-medium transition-colors rounded-md bg-primary text-white hover:bg-primary/90"
                            >
                                Get Directions
                            </a>
                        </div>

                        <div className="mt-6">
                            <h4 className="mb-3 text-sm font-medium uppercase text-white/80">Available Amenities</h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedCinema.facilities.map((facility, index) => (
                                    <span
                                        key={index}
                                        className="inline-block px-3 py-1 text-sm rounded-md bg-white/10 text-white/90"
                                    >
                                        {facility}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between mt-6 pt-4 border-t border-white/10">
                            <button className="text-sm font-medium text-primary hover:text-primary/80">
                                View Showtimes
                            </button>
                            <button className="text-sm font-medium text-primary hover:text-primary/80">
                                Book Private Event
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default CinemaLocationsSection;
