<?php

namespace App\Http\Controllers;

use App\Services\ImageService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class ImageController extends Controller
{
    protected $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    public function show(Request $request, $path)
    {
        try {
            $width = $request->get('w') ? (int)$request->get('w') : null;
            $height = $request->get('h') ? (int)$request->get('h') : null;
            $quality = (int)$request->get('q', 80);

            // Validate dimensions
            if ($width && ($width < 1 || $width > 2000)) {
                return response()->json(['error' => 'Invalid width parameter'], 400);
            }
            if ($height && ($height < 1 || $height > 2000)) {
                return response()->json(['error' => 'Invalid height parameter'], 400);
            }
            if ($quality < 1 || $quality > 100) {
                $quality = 80;
            }

            $image = $this->imageService->getOptimizedImage($path, $width, $height, $quality);

            if (!$image) {
                return response()->json(['error' => 'Image not found'], 404);
            }

            // Calculate ETag based on image parameters
            $etag = md5($path . $width . $height . $quality);

            // Check if the client has a valid cached version
            if ($request->header('If-None-Match') === $etag) {
                return response()->noContent(304);
            }

            return response($image)
                ->header('Content-Type', 'image/jpeg')
                ->header('Cache-Control', 'public, max-age=31536000, immutable')
                ->header('ETag', $etag)
                ->header('Last-Modified', now()->toRfc7231String());

        } catch (\Exception $e) {
            Log::error('Image optimization failed', [
                'path' => $path,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Failed to process image'], 500);
        }
    }
}
