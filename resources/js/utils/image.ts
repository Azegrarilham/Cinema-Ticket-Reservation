export function getOptimizedImageUrl(path: string | null, width?: number, height?: number, quality: number = 80): string {
    if (!path) {
        return '/images/placeholder.png';
    }

    if (path.startsWith('http')) {
        return path;
    }

    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('q', quality.toString());

    return `/img/${path.replace(/^\/storage\//, '')}?${params.toString()}`;
}
