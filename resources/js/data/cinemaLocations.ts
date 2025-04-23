// Define cinema location interface
export interface CinemaLocation {
    id: number;
    name: string;
    address: string;
    city: string;
    position: [number, number]; // [latitude, longitude]
    screens: number;
    facilities: string[];
}

// Sample data for cinema locations in Rabat, Morocco
export const CINEMA_LOCATIONS: CinemaLocation[] = [
    {
        id: 1,
        name: 'CineVerse Rabat City Center',
        address: '15 Avenue Mohammed V',
        city: 'Rabat',
        position: [34.0232, -6.8348], // Rabat City Center
        screens: 12,
        facilities: ['IMAX', 'Dolby Atmos', 'VIP Lounge', 'Restaurant'],
    },
    {
        id: 2,
        name: 'CineVerse Hay Riad',
        address: '74 Boulevard Annakhil',
        city: 'Rabat',
        position: [33.9617, -6.8682], // Hay Riad district
        screens: 10,
        facilities: ['4DX', 'Luxury Seating', 'Bar'],
    },
    {
        id: 3,
        name: 'CineVerse Agdal',
        address: '23 Avenue de France',
        city: 'Rabat',
        position: [33.9893, -6.8644], // Agdal district
        screens: 8,
        facilities: ['RPX', 'Private Screening Rooms', 'Arcade'],
    },
    {
        id: 4,
        name: 'CineVerse Moroccan Mall',
        address: '42 Boulevard Al Massira',
        city: 'Rabat',
        position: [34.0185, -6.8335], // Near Moroccan Mall location
        screens: 15,
        facilities: ['IMAX', 'ScreenX', 'Dining'],
    },
    {
        id: 5,
        name: 'CineVerse Ocean Plaza',
        address: '7 Avenue Chellah',
        city: 'Rabat',
        position: [34.0148, -6.8211], // Near coastal area
        screens: 9,
        facilities: ['Dolby Cinema', 'Recliner Seats', 'Lounge'],
    },
];
