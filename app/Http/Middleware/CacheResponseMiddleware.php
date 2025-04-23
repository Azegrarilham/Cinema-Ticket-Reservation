<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CacheResponseMiddleware
{
    private const CRITICAL_PATHS = [
        'films' => true,
        'img/posters' => true
    ];

    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        if ($this->shouldCache($request, $response)) {
            $this->addCacheHeaders($response);

            // Add preload headers for critical resources
            if ($this->isCriticalPath($request->path())) {
                $this->addPreloadHeaders($response);
            }
        }

        return $response;
    }

    private function shouldCache(Request $request, Response $response): bool
    {
        if (!$request->isMethod('GET')) {
            return false;
        }

        if (!$response->isSuccessful()) {
            return false;
        }

        // Always cache optimized images with longer TTL
        if ($request->is('img/*')) {
            return true;
        }

        // Cache other static assets
        if ($this->isAsset($request->getPathInfo())) {
            return true;
        }

        // Cache API responses for films with shorter TTL
        if ($request->is('films/*') || $request->is('api/films/*')) {
            return true;
        }

        return false;
    }

    private function addCacheHeaders(Response $response): void
    {
        $headers = [
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'Vary' => 'Accept-Encoding'
        ];

        // Use different cache settings for dynamic content
        if (str_contains($response->headers->get('Content-Type', ''), 'application/json')) {
            $headers['Cache-Control'] = 'public, max-age=300, stale-while-revalidate=60';
        }

        // Don't override ETag if already set
        if (!$response->headers->has('ETag')) {
            $headers['ETag'] = '"' . md5($response->getContent()) . '"';
        }

        $response->headers->add($headers);
    }

    private function addPreloadHeaders(Response $response): void
    {
        if ($response->headers->has('Link')) {
            return;
        }

        $preloadLinks = [];

        // Add preload for critical images in film responses
        if (str_contains($response->headers->get('Content-Type', ''), 'application/json')) {
            $content = json_decode($response->getContent(), true);
            if (isset($content['data']['poster_image'])) {
                $preloadLinks[] = "<{$content['data']['poster_image']}>; rel=preload; as=image";
            }
        }

        if (!empty($preloadLinks)) {
            $response->headers->set('Link', implode(', ', $preloadLinks));
        }
    }

    private function isCriticalPath(string $path): bool
    {
        foreach (self::CRITICAL_PATHS as $criticalPath => $value) {
            if (str_starts_with($path, $criticalPath)) {
                return true;
            }
        }
        return false;
    }

    private function isAsset(string $path): bool
    {
        $extensions = ['jpg', 'jpeg', 'png', 'gif', 'css', 'js', 'ico', 'svg', 'woff', 'woff2', 'ttf'];
        $pathInfo = pathinfo($path);
        return isset($pathInfo['extension']) && in_array(strtolower($pathInfo['extension']), $extensions);
    }
}
