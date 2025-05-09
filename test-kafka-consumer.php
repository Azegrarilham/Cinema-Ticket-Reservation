<?php

require __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Get the ConsumerService instance
$consumerService = app(\App\Services\ConsumerService::class);

echo "Testing Kafka Consumer...\n";

// Simulate receiving a message from booking-created topic
echo "Testing booking-created handler...\n";
try {
    $consumerService->handleBookingCreated([
        'reservation_id' => 1,
        'user_id' => 1,
        'timestamp' => date('Y-m-d H:i:s'),
        'test' => true
    ]);
    echo "Successfully processed booking-created message\n";
} catch (\Exception $e) {
    echo "Error processing booking-created message: " . $e->getMessage() . "\n";
}

// Simulate receiving a message from payment-processed topic
echo "\nTesting payment-processed handler...\n";
try {
    $consumerService->handlePaymentProcessed([
        'payment_id' => 1,
        'reservation_id' => 1,
        'amount' => 50.00,
        'status' => 'completed',
        'timestamp' => date('Y-m-d H:i:s'),
        'test' => true
    ]);
    echo "Successfully processed payment-processed message\n";
} catch (\Exception $e) {
    echo "Error processing payment-processed message: " . $e->getMessage() . "\n";
}

echo "Done!\n";
