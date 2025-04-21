<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Film extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'duration',
        'poster_image',
        'genre',
        'release_date',
        'director',
        'is_featured',
    ];

    protected $casts = [
        'release_date' => 'date',
        'is_featured' => 'boolean',
        'duration' => 'integer',
    ];

    /**
     * Get the screenings for the film.
     */
    public function screenings(): HasMany
    {
        return $this->hasMany(Screening::class);
    }

    /**
     * Get the future screenings for the film.
     */
    public function futureScreenings(): HasMany
    {
        return $this->hasMany(Screening::class)
            ->where('start_time', '>', now())
            ->where('is_active', true)
            ->orderBy('start_time');
    }

    /**
     * Get all reservations for the film through screenings.
     */
    public function reservations(): HasManyThrough
    {
        return $this->hasManyThrough(Reservation::class, Screening::class);
    }
}
