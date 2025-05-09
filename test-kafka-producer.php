<?php

require __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Get the KafkaService instance
$kafkaService = app(\App\Services\KafkaService::class);

echo "Testing Kafka Producer...\n";

// Test publishing to booking-created topic
$result = $kafkaService->publish('booking-created', [
    'reservation_id' => 1,
    'user_id' => 1,
    'timestamp' => date('Y-m-d H:i:s'),
    'test' => true
]);

echo "Published to booking-created: " . ($result ? "SUCCESS" : "FAILED") . "\n";

// Test publishing to payment-processed topic
$result = $kafkaService->publish('payment-processed', [
    'payment_id' => 1,
    'reservation_id' => 1,
    'amount' => 50.00,
    'status' => 'completed',
    'timestamp' => date('Y-m-d H:i:s'),
    'test' => true
]);

echo "Published to payment-processed: " . ($result ? "SUCCESS" : "FAILED") . "\n";

echo "Done!\n";
