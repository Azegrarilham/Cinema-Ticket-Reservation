<?php

namespace App\Notifications;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingConfirmedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $reservation;

    public function __construct(Reservation $reservation)
    {
        $this->reservation = $reservation;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $url = url('/reservations/' . $this->reservation->id);

        return (new MailMessage)
            ->subject('Your Booking is Confirmed')
            ->line('Your booking has been confirmed.')
            ->line('Movie: ' . $this->reservation->screening->movie->title)
            ->line('Date: ' . $this->reservation->screening->start_time->format('Y-m-d'))
            ->line('Time: ' . $this->reservation->screening->start_time->format('H:i'))
            ->line('Theater: ' . $this->reservation->screening->theater->name)
            ->line('Seats: ' . $this->getSeatsString())
            ->action('View Booking Details', $url)
            ->line('Thank you for using our cinema booking service!');
    }

    protected function getSeatsString(): string
    {
        return $this->reservation->reservationSeats->map(function ($reservationSeat) {
            return $reservationSeat->seat->row . '-' . $reservationSeat->seat->number;
        })->implode(', ');
    }
}
