<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Kafka\ConsumerConfig;
use Kafka\Producer;
use Kafka\ProducerConfig;
use Illuminate\Support\Facades\Log;

class TestKafkaConnection extends Command
{
    protected $signature = 'kafka:test-connection';
    protected $description = 'Test Kafka connection by producing and consuming a test message';

    public function handle()
    {
        $this->info('Testing Kafka connection...');

        try {
            // Configure and create producer
            $config = ProducerConfig::getInstance();
            $config->setMetadataBrokerList(config('kafka.brokers'));
            $config->setRequiredAck(1);
            $config->setIsAsyn(false);
            $config->setProduceInterval(500);

            $producer = new Producer();

            $testMessage = [
                'topic' => 'test-topic',
                'value' => json_encode(['message' => 'test', 'timestamp' => time()]),
                'key' => 'test-key'
            ];

            $this->info('Attempting to send test message...');
            $producer->send([$testMessage]);
            $this->info('Test message sent successfully!');

            return 0;
        } catch (\Exception $e) {
            $this->error('Error testing Kafka connection: ' . $e->getMessage());
            Log::error('Kafka connection test failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}
