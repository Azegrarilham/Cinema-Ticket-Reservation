<?php

namespace App\Models;

use App\Traits\PublishesKafkaEvents;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory, PublishesKafkaEvents;

    protected $fillable = [
        'reservation_id',
        'amount',
        'status',
        'payment_method',
        'transaction_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    protected static function booted()
    {
        static::updated(function ($payment) {
            if ($payment->isDirty('status')) {
                $payment->publishKafkaEvent(config('kafka.topics.payment_processed'), [
                    'payment_id' => $payment->id,
                    'reservation_id' => $payment->reservation_id,
                    'status' => $payment->status,
                    'amount' => $payment->amount,
                    'updated_at' => $payment->updated_at
                ]);
            }
        });
    }

    /**
     * Get the reservation associated with the payment.
     */
    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    /**
     * Check if the payment is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }
}
