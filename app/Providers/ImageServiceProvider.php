<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Console\Scheduling\Schedule;

class ImageServiceProvider extends ServiceProvider
{
    public function register()
    {
        //
    }

    public function boot()
    {
        $this->app->booted(function () {
            $this->app->make(Schedule::class)->command('image:cleanup')->daily();
        });

        $this->commands([
            \App\Console\Commands\CleanupImageCache::class
        ]);
    }
}
