<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use App\Services\ImageService;

class CleanupImageCache extends Command
{
    protected $signature = 'image:cleanup {--force : Force cleanup of all cached images}';
    protected $description = 'Clean up old cached images';

    protected $imageService;

    public function __construct(ImageService $imageService)
    {
        parent::__construct();
        $this->imageService = $imageService;
    }

    public function handle()
    {
        $cacheDir = storage_path('framework/cache/images');

        if ($this->option('force')) {
            $this->warn('Force cleaning all cached images...');
            $this->imageService->clearImageCache();
            $this->info('All cached images have been cleared.');
            return;
        }

        $maxAge = now()->subDays(7)->getTimestamp();
        $count = 0;

        if (!is_dir($cacheDir)) {
            $this->warn('Cache directory does not exist. Nothing to clean.');
            return;
        }

        foreach (glob($cacheDir . '/*.jpg') as $file) {
            if (filemtime($file) < $maxAge) {
                if (unlink($file)) {
                    $count++;
                }
            }
        }

        $this->info("Image cache cleanup completed. Removed {$count} old images.");
    }
}
