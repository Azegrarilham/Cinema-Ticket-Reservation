<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Seat extends Model
{
    use HasFactory;

    protected $fillable = [
        'screening_id',
        'row',
        'number',
        'status',
    ];

    /**
     * Get the screening that owns the seat.
     */
    public function screening(): BelongsTo
    {
        return $this->belongsTo(Screening::class);
    }

    /**
     * Get the reservation seat associated with the seat.
     */
    public function reservationSeat(): HasOne
    {
        return $this->hasOne(ReservationSeat::class);
    }

    /**
     * Check if the seat is available.
     */
    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    /**
     * Get the seat label (e.g. "A1", "B5").
     */
    public function getLabelAttribute(): string
    {
        return $this->row . $this->number;
    }
}
