<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class ImageService
{
    private const CACHE_TTL = 604800; // 1 week in seconds
    private const CACHE_PREFIX = 'image_cache_';

    public function getOptimizedImage(string $path, ?int $width = null, ?int $height = null, int $quality = 80)
    {
        $cacheKey = $this->generateCacheKey($path, $width, $height, $quality);

        // First try to get from file cache
        $cachedPath = $this->getCachedImagePath($cacheKey);
        if (file_exists($cachedPath)) {
            return file_get_contents($cachedPath);
        }

        try {
            $originalPath = Storage::disk('public')->path($path);

            if (!file_exists($originalPath)) {
                return null;
            }

            $image = Image::make($originalPath);

            if ($width && $height) {
                $image->fit($width, $height, function ($constraint) {
                    $constraint->aspectRatio();
                });
            } elseif ($width) {
                $image->resize($width, null, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                });
            } elseif ($height) {
                $image->resize(null, $height, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                });
            }

            $image->encode('jpg', $quality);

            // Save to file cache
            $this->saveToCache($cacheKey, $image);

            return $image->encoded;
        } catch (\Exception $e) {
            report($e);
            return null;
        }
    }

    private function generateCacheKey(string $path, ?int $width, ?int $height, int $quality): string
    {
        $hash = md5($path . $width . $height . $quality);
        return self::CACHE_PREFIX . $hash;
    }

    private function getCachedImagePath(string $cacheKey): string
    {
        return storage_path('framework/cache/images/' . $cacheKey . '.jpg');
    }

    private function saveToCache(string $cacheKey, $image): void
    {
        $cachePath = $this->getCachedImagePath($cacheKey);
        $cacheDir = dirname($cachePath);

        if (!is_dir($cacheDir)) {
            mkdir($cacheDir, 0755, true);
        }

        file_put_contents($cachePath, $image->encoded);
    }

    public function clearImageCache(?string $path = null): void
    {
        if ($path) {
            $pattern = storage_path('framework/cache/images/' . self::CACHE_PREFIX . md5($path) . '*.jpg');
            array_map('unlink', glob($pattern));
        } else {
            $pattern = storage_path('framework/cache/images/' . self::CACHE_PREFIX . '*.jpg');
            array_map('unlink', glob($pattern));
        }
    }
}
