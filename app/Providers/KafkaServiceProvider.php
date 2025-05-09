<?php

namespace App\Providers;

use App\Services\KafkaService;
use Illuminate\Support\ServiceProvider;

class KafkaServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->singleton('kafka.service', function ($app) {
            return new KafkaService();
        });

        $this->app->bind(KafkaService::class, function ($app) {
            return $app->make('kafka.service');
        });
    }

    public function boot()
    {
        //
    }
}
