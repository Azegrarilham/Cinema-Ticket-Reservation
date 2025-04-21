<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'screening_id',
        'user_id',
        'guest_name',
        'guest_email',
        'guest_phone',
        'status',
        'reservation_code',
        'confirmation_code',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($reservation) {
            $reservation->reservation_code = Str::random(10);
            $reservation->confirmation_code = 'CONF-' . strtoupper(Str::random(8));
        });
    }

    /**
     * Get the screening that the reservation belongs to.
     */
    public function screening(): BelongsTo
    {
        return $this->belongsTo(Screening::class);
    }

    /**
     * Get the user that owns the reservation.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the reservation seats for the reservation.
     */
    public function reservationSeats(): HasMany
    {
        return $this->hasMany(ReservationSeat::class);
    }

    /**
     * Get the payment for the reservation.
     */
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    /**
     * Get the total price of the reservation.
     */
    public function getTotalPriceAttribute(): float
    {
        // If reservation seats are already loaded, use them
        if ($this->relationLoaded('reservationSeats') && $this->reservationSeats->isNotEmpty()) {
            return $this->reservationSeats->sum('price');
        }

        // Otherwise, query the database directly
        return (float) $this->reservationSeats()->sum('price') ?: 0.0;
    }

    /**
     * Get the seats count.
     */
    public function getSeatsCountAttribute(): int
    {
        return $this->reservationSeats->count();
    }
}
