<?php

namespace App\Console\Commands;

use App\Models\Reservation;
use App\Notifications\TicketConfirmationNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;

class TestEmailCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:test {email?} {reservation_id?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the email sending functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email') ?: $this->ask('Please enter your email address');
        $reservationId = $this->argument('reservation_id');

        $this->info("Testing email sending to: {$email}");

        if ($reservationId) {
            // If a reservation ID is provided, send a ticket confirmation
            $reservation = Reservation::findOrFail($reservationId);
            $this->info("Sending confirmation for reservation ID: {$reservationId}");

            // Send notification (with ticket)
            Notification::route('mail', $email)
                ->notify(new TicketConfirmationNotification($reservation));

            $this->info("Ticket confirmation email sent to {$email}");
        } else {
            // Otherwise, send a simple test email
            $this->info("Sending basic test email to {$email}");

            Mail::raw('This is a test email from your CineVerse application.', function ($message) use ($email) {
                $message->to($email)
                    ->subject('CineVerse Test Email');
            });

            $this->info("Test email sent to {$email}");
        }

        $this->info('Remember to check your SPAM folder if you don\'t see the email!');

        return Command::SUCCESS;
    }
}
