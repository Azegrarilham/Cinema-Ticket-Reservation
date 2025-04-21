<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Screening extends Model
{
    use HasFactory;

    protected $fillable = [
        'film_id',
        'start_time',
        'room',
        'total_seats',
        'price',
        'is_active',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
        'total_seats' => 'integer',
    ];

    /**
     * Get the film that owns the screening.
     */
    public function film(): BelongsTo
    {
        return $this->belongsTo(Film::class);
    }

    /**
     * Get the seats for the screening.
     */
    public function seats(): HasMany
    {
        return $this->hasMany(Seat::class);
    }

    /**
     * Get the reservations for the screening.
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    /**
     * Get available seats count for the screening.
     */
    public function getAvailableSeatsCountAttribute(): int
    {
        return $this->seats()->where('status', 'available')->count();
    }

    /**
     * Check if the screening is fully booked.
     */
    public function getIsFullyBookedAttribute(): bool
    {
        return $this->available_seats_count === 0;
    }

    /**
     * Get the end time of the screening.
     */
    public function getEndTimeAttribute()
    {
        return $this->start_time->addMinutes($this->film->duration);
    }

    /**
     * Get all reservation seats for the screening through reservations.
     */
    public function reservationSeats(): HasManyThrough
    {
        return $this->hasManyThrough(
            ReservationSeat::class,
            Reservation::class,
            'screening_id', // Foreign key on Reservation table...
            'reservation_id', // Foreign key on ReservationSeat table...
            'id', // Local key on Screening table...
            'id' // Local key on Reservation table...
        );
    }
}
