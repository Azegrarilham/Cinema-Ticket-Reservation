<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KafkaService
{
    private string $restProxyUrl;

    public function __construct()
    {
        $this->restProxyUrl = config('kafka.rest_proxy_url', 'http://localhost:8082');
        Log::channel('kafka')->info('KafkaService initialized', [
            'rest_proxy_url' => $this->restProxyUrl
        ]);
    }

    public function publish(string $topic, array $data): bool
    {
        try {
            Log::channel('kafka')->debug('Preparing to publish message', [
                'topic' => $topic,
                'data' => $data
            ]);

            $message = [
                'records' => [
                    [
                        'value' => $data
                    ]
                ]
            ];

            $response = Http::withHeaders([
                'Content-Type' => 'application/vnd.kafka.json.v2+json',
                'Accept' => 'application/vnd.kafka.v2+json'
            ])->post("{$this->restProxyUrl}/topics/{$topic}", $message);

            if ($response->successful()) {
                Log::channel('kafka')->info('Successfully published message', [
                    'topic' => $topic,
                    'response' => $response->json()
                ]);
                return true;
            }

            Log::channel('kafka')->error('Failed to publish message', [
                'topic' => $topic,
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return false;

        } catch (\Exception $e) {
            Log::channel('kafka')->error('Error publishing message', [
                'topic' => $topic,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    public function consume(string $topic, string $groupId): array
    {
        try {
            Log::channel('kafka')->debug('Starting consumer', [
                'topic' => $topic,
                'group_id' => $groupId
            ]);

            $response = Http::get("{$this->restProxyUrl}/topics/{$topic}/partitions/0/messages", [
                'timeout' => 1000,
                'max_bytes' => 52428800
            ]);

            if ($response->successful()) {
                $messages = $response->json();
                Log::channel('kafka')->info('Successfully consumed messages', [
                    'topic' => $topic,
                    'count' => count($messages)
                ]);
                return $messages;
            }

            Log::channel('kafka')->error('Failed to consume messages', [
                'topic' => $topic,
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return [];

        } catch (\Exception $e) {
            Log::channel('kafka')->error('Error consuming messages', [
                'topic' => $topic,
                'group_id' => $groupId,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }
}
