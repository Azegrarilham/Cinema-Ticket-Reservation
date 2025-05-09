<?php

namespace App\Models;

use App\Traits\PublishesKafkaEvents;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReservationSeat extends Model
{
    use HasFactory, PublishesKafkaEvents;

    protected $fillable = [
        'reservation_id',
        'seat_id',
        'price',
        'status'
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    protected static function booted()
    {
        static::created(function ($reservationSeat) {
            $reservationSeat->publishKafkaEvent(config('kafka.topics.seat_reserved'), [
                'reservation_seat_id' => $reservationSeat->id,
                'reservation_id' => $reservationSeat->reservation_id,
                'seat_id' => $reservationSeat->seat_id,
                'status' => $reservationSeat->status,
                'price' => $reservationSeat->price,
                'created_at' => $reservationSeat->created_at
            ]);
        });
    }

    /**
     * Get the reservation that the seat belongs to.
     */
    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    /**
     * Get the seat that is reserved.
     */
    public function seat(): BelongsTo
    {
        return $this->belongsTo(Seat::class);
    }
}
