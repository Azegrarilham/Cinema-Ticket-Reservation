<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class StartKafkaConsumers extends Command
{
    protected $signature = 'kafka:start-consumers';
    protected $description = 'Start all Kafka consumers';

    private $topics = [
        'booking-created',
        'payment-processed',
        'seat-reserved',
        'booking-confirmed',
        'booking-cancelled'
    ];

    private $processes = [];

    public function handle()
    {
        $this->info('Starting Kafka consumers...');

        foreach ($this->topics as $topic) {
            $this->startConsumer($topic);
        }

        // Monitor processes and restart if they fail
        while (true) {
            foreach ($this->processes as $topic => $process) {
                if (!$process->isRunning()) {
                    $this->error("A consumer has stopped unexpectedly. Restarting...");
                    $this->startConsumer($topic);
                }
            }
            sleep(1);
        }
    }

    private function startConsumer(string $topic)
    {
        $process = new Process(['php', 'artisan', 'kafka:consume', $topic]);
        $process->setWorkingDirectory(base_path());
        $process->start();

        $this->processes[$topic] = $process;
        $this->info("Started consumer for topic: {$topic}");
    }

    public function __destruct()
    {
        foreach ($this->processes as $process) {
            $process->stop();
        }
    }
}
