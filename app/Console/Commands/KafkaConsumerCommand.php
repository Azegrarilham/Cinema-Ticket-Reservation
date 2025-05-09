<?php

namespace App\Console\Commands;

use App\Services\ConsumerService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class KafkaConsumerCommand extends Command
{
    protected $signature = 'kafka:consume {topic}';
    protected $description = 'Start a Kafka consumer for the specified topic';

    private $consumerService;

    public function __construct(ConsumerService $consumerService)
    {
        parent::__construct();
        $this->consumerService = $consumerService;
    }

    public function handle()
    {
        $topic = $this->argument('topic');
        $groupId = config('kafka.group_id');

        $this->info("Starting consumer for topic: {$topic}");

        while (true) {
            try {
                $messages = app()->make('kafka.service')->consume($topic, $groupId);

                foreach ($messages as $message) {
                    $this->processMessage($topic, $message);
                }

                // Small delay to prevent excessive CPU usage
                usleep(100000); // 100ms delay
            } catch (\Exception $e) {
                Log::error("Error in Kafka consumer", [
                    'topic' => $topic,
                    'error' => $e->getMessage()
                ]);

                // Wait before retrying
                sleep(5);
            }
        }
    }

    private function processMessage(string $topic, array $message): void
    {
        $data = json_decode($message['value'], true);

        switch ($topic) {
            case 'booking-created':
                $this->consumerService->handleBookingCreated($data);
                break;
            case 'payment-processed':
                $this->consumerService->handlePaymentProcessed($data);
                break;
            case 'seat-reserved':
                $this->consumerService->handleSeatReserved($data);
                break;
            case 'booking-confirmed':
                $this->consumerService->handleBookingConfirmed($data);
                break;
            case 'booking-cancelled':
                $this->consumerService->handleBookingCancelled($data);
                break;
            default:
                Log::warning("Unknown topic received", ['topic' => $topic]);
        }
    }
}
