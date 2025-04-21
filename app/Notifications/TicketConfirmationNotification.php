<?php

namespace App\Notifications;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Barryvdh\DomPDF\Facade\Pdf;

class TicketConfirmationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @var Reservation
     */
    protected $reservation;

    /**
     * Create a new notification instance.
     */
    public function __construct(Reservation $reservation)
    {
        $this->reservation = $reservation;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $reservation = $this->reservation;
        $reservation->load(['screening.film', 'reservationSeats.seat']);

        // Prepare seats data
        $seats = $reservation->reservationSeats->map(function ($reservationSeat) {
            return $reservationSeat->seat;
        });
        $reservation->seats = $seats;

        // Format seat numbers for display
        $seatsList = $seats->sortBy(function ($seat) {
            return $seat->row . str_pad($seat->number, 3, '0', STR_PAD_LEFT);
        })->map(function ($seat) {
            return $seat->row . $seat->number;
        })->implode(', ');

        // Generate PDF
        $pdf = Pdf::loadView('tickets.download', [
            'reservation' => $reservation,
            'seatsList' => $seatsList,
        ]);

        $filmTitle = $reservation->screening->film->title;
        $screeningDate = $reservation->screening->start_time->format('l, F j, Y');
        $screeningTime = $reservation->screening->start_time->format('g:i A');

        return (new MailMessage)
            ->subject("Your Ticket Confirmation for {$filmTitle}")
            ->greeting("Hello " . ($reservation->guest_name ?? ($notifiable->name ?? "there")) . "!")
            ->line("Thank you for your purchase. Your booking for {$filmTitle} has been confirmed.")
            ->line("**Screening Details:**")
            ->line("- Date: {$screeningDate}")
            ->line("- Time: {$screeningTime}")
            ->line("- Room: {$reservation->screening->room}")
            ->line("- Seats: {$seatsList}")
            ->line("**Confirmation Code:** {$reservation->reservation_code}")
            ->line("Please find your ticket attached to this email. You can present it digitally or print it for entry.")
            ->action('View Booking Details', url("/reservations/{$reservation->id}"))
            ->line('We look forward to seeing you at the cinema!')
            ->attachData($pdf->output(), "ticket-{$reservation->reservation_code}.pdf", [
                'mime' => 'application/pdf',
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'reservation_id' => $this->reservation->id,
            'film_title' => $this->reservation->screening->film->title,
            'screening_time' => $this->reservation->screening->start_time->toDateTimeString(),
        ];
    }
}
