<?php

return [
    'brokers' => env('KAFKA_BROKERS', 'localhost:9093'),
    'client_id' => env('KAFKA_CLIENT_ID', 'cinema-ticket-reservation'),
    'group_id' => env('KAFKA_CONSUMER_GROUP_ID', 'cinema-consumer-group'),
    'rest_proxy_url' => env('KAFKA_REST_PROXY_URL', 'http://localhost:8082'),

    'topics' => [
        'booking_created' => env('KAFKA_TOPIC_BOOKING_CREATED', 'booking-created'),
        'payment_processed' => env('KAFKA_TOPIC_PAYMENT_PROCESSED', 'payment-processed'),
        'seat_reserved' => env('KAFKA_TOPIC_SEAT_RESERVED', 'seat-reserved'),
        'booking_confirmed' => env('KAFKA_TOPIC_BOOKING_CONFIRMED', 'booking-confirmed'),
        'booking_cancelled' => env('KAFKA_TOPIC_BOOKING_CANCELLED', 'booking-cancelled'),
    ],

    'consumer' => [
        'auto_offset_reset' => 'earliest',
        'enable_auto_commit' => true,
    ],

    'producer' => [
        'compression_type' => 'snappy',
        'required_acks' => 1,
        'timeout_ms' => 5000,
    ],
];
