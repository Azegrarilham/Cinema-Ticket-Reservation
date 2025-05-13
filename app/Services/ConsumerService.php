<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\Payment;
use App\Notifications\TicketConfirmationNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class ConsumerService
{
    protected $kafkaService;

    public function __construct(KafkaService $kafkaService)
    {
        $this->kafkaService = $kafkaService;
    }

    public function handleBookingCreated(array $data): void
    {
        try {
            $reservation = Reservation::with(['user', 'screening', 'reservationSeats'])
                ->findOrFail($data['reservation_id']);

            if ($reservation->user) {
                $reservation->user->notify(new TicketConfirmationNotification($reservation));
            }

            Log::info('BookingCreatedConsumer: Processed booking creation', [
                'reservation_id' => $reservation->id,
                'user_id' => $reservation->user_id
            ]);
        } catch (\Exception $e) {
            Log::error('BookingCreatedConsumer: Error processing message', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    public function handlePaymentProcessed(array $data): void
    {
        try {
            $payment = Payment::with('reservation')->findOrFail($data['payment_id']);
            $reservation = $payment->reservation;

            if ($payment->status === 'completed') {
                $reservation->status = 'confirmed';
                $reservation->save();

                foreach ($reservation->reservationSeats as $seat) {
                    $seat->status = 'occupied';
                    $seat->save();
                }
            }

            Log::info('PaymentProcessedConsumer: Processed payment', [
                'payment_id' => $payment->id,
                'status' => $payment->status
            ]);
        } catch (\Exception $e) {
            Log::error('PaymentProcessedConsumer: Error processing message', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    public function handleSeatReserved(array $data): void
    {
        try {
            $reservationSeat = \App\Models\ReservationSeat::with(['reservation', 'seat'])
                ->findOrFail($data['reservation_seat_id']);

            $seat = $reservationSeat->seat;
            $seat->status = 'reserved';
            $seat->save();

            Log::info('SeatReservedConsumer: Processed seat reservation', [
                'reservation_id' => $reservationSeat->reservation_id,
                'seat_id' => $seat->id
            ]);
        } catch (\Exception $e) {
            Log::error('SeatReservedConsumer: Error processing message', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    public function handleBookingConfirmed(array $data): void
    {
        try {
            $reservation = Reservation::with(['user', 'reservationSeats'])
                ->findOrFail($data['reservation_id']);

            // Generate ticket or perform other confirmation actions
            if ($reservation->user) {
                $reservation->user->notify(new \App\Notifications\BookingConfirmedNotification($reservation));
            }

            Log::info('BookingConfirmedConsumer: Processed booking confirmation', [
                'reservation_id' => $reservation->id
            ]);
        } catch (\Exception $e) {
            Log::error('BookingConfirmedConsumer: Error processing message', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    public function handleBookingCancelled(array $data): void
    {
        try {
            $reservation = Reservation::with('reservationSeats')->findOrFail($data['reservation_id']);

            foreach ($reservation->reservationSeats as $reservationSeat) {
                $seat = $reservationSeat->seat;
                $seat->status = 'available';
                $seat->save();

                // Delete the reservation seat
                $reservationSeat->delete();
            }

            $reservation->status = 'cancelled';
            $reservation->save();

            Log::info('BookingCancelledConsumer: Processed booking cancellation', [
                'reservation_id' => $reservation->id
            ]);
        } catch (\Exception $e) {
            Log::error('BookingCancelledConsumer: Error processing message', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }
}
