<?php

namespace App\Console\Commands;

use App\Services\KafkaService;
use Illuminate\Console\Command;

class TestKafkaPublish extends Command
{
    protected $signature = 'kafka:test-publish';
    protected $description = 'Test Kafka message publishing';

    public function handle(KafkaService $kafka)
    {
        $testMessage = [
            'test_id' => uniqid(),
            'timestamp' => time(),
            'message' => 'Test message'
        ];

        $this->info('Sending test message to Kafka...');

        $result = $kafka->publish('booking-created', $testMessage);

        if ($result) {
            $this->info('Test message sent successfully!');
        } else {
            $this->error('Failed to send test message.');
        }
    }
}
