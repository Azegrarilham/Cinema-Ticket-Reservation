/**
 * Theme initialization helper
 * This file contains functions to handle theme/appearance settings
 */

import { useState, useEffect } from 'react';

export type Appearance = 'system' | 'light' | 'dark';

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('system');

    useEffect(() => {
        const savedAppearance = localStorage.getItem('appearance') as Appearance;
        if (savedAppearance) {
            setAppearance(savedAppearance);
            updateTheme(savedAppearance);
        }
    }, []);

    const updateTheme = (newAppearance: Appearance) => {
        const isDark =
            newAppearance === 'dark' ||
            (newAppearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('appearance', newAppearance);
    };

    const setTheme = (newAppearance: Appearance) => {
        setAppearance(newAppearance);
        updateTheme(newAppearance);
    };

    return { appearance, setTheme };
}

/**
 * Initialize the theme based on user preferences or system settings
 */
export function initializeTheme(): void {
    const savedAppearance = localStorage.getItem('appearance') as Appearance;
    const isDark =
        savedAppearance === 'dark' ||
        ((!savedAppearance || savedAppearance === 'system') &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);

    document.documentElement.classList.toggle('dark', isDark);
}
