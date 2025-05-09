<?php

namespace App\Traits;

use App\Services\KafkaService;
use Illuminate\Support\Facades\Log;

trait PublishesKafkaEvents
{
    protected function publishKafkaEvent(string $topic, array $data): bool
    {
        try {
            $kafka = app(KafkaService::class);
            return $kafka->publish($topic, $data);
        } catch (\Exception $e) {
            Log::error('Failed to publish Kafka event', [
                'topic' => $topic,
                'data' => $data,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}
