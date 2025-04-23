import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface ImagePreloaderProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    quality?: number;
    onLoad?: () => void;
}

export function ImagePreloader({
    src,
    alt,
    width,
    height,
    className = '',
    priority = false,
    quality = 80,
    onLoad
}: ImagePreloaderProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const image = imageRef.current;

        if (!image || priority) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    image.src = getOptimizedSrc(src, width, height, quality);
                    observerRef.current?.disconnect();
                }
            },
            { rootMargin: '50px' }
        );

        observerRef.current.observe(image);

        return () => {
            observerRef.current?.disconnect();
        };
    }, [src, width, height, quality, priority]);

    useEffect(() => {
        if (priority && imageRef.current) {
            imageRef.current.src = getOptimizedSrc(src, width, height, quality);
        }
    }, [src, width, height, quality, priority]);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        setError(true);
        setIsLoaded(true);
    };

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 0 : 1 }}
                className="absolute inset-0 bg-gray-800 animate-pulse"
            />

            {error ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <span className="text-gray-400">Failed to load image</span>
                </div>
            ) : (
                <img
                    ref={imageRef}
                    alt={alt}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    width={width}
                    height={height}
                    onLoad={handleLoad}
                    onError={handleError}
                    loading={priority ? 'eager' : 'lazy'}
                />
            )}
        </div>
    );
}

function getOptimizedSrc(src: string, width?: number, height?: number, quality: number = 80): string {
    if (!src) return '';
    if (src.startsWith('http')) return src;

    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('q', quality.toString());

    return `/img/${src.replace(/^\/storage\//, '')}?${params.toString()}`;
}
