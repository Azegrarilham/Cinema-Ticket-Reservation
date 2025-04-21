<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Screening;
use App\Models\Seat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SeatController extends Controller
{
    /**
     * Get seat availability for a screening.
     */
    public function getSeats(Screening $screening)
    {
        $seats = $screening->seats()
            ->orderBy('row')
            ->orderBy('number')
            ->get(['id', 'row', 'number', 'status']);

        return response()->json([
            'seats' => $seats,
            'updated_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * Temporarily reserve seats during booking process.
     */
    public function reserveTemporarily(Request $request)
    {
        $validated = $request->validate([
            'seat_ids' => 'required|array|min:1',
            'seat_ids.*' => 'required|exists:seats,id',
            'session_id' => 'required|string',
        ]);

        $seats = Seat::whereIn('id', $validated['seat_ids'])
            ->where('status', 'available')
            ->get();

        if ($seats->count() !== count($validated['seat_ids'])) {
            return response()->json([
                'success' => false,
                'message' => 'Some selected seats are no longer available.',
            ], 400);
        }

        // Store in cache for 10 minutes
        $cacheKey = 'temp_seats_' . $validated['session_id'];
        Cache::put($cacheKey, $validated['seat_ids'], now()->addMinutes(10));

        // We don't actually change seat status here to avoid blocking seats
        // if the user abandons the reservation process

        return response()->json([
            'success' => true,
            'expires_at' => now()->addMinutes(10)->toIso8601String(),
        ]);
    }

    /**
     * Release temporarily reserved seats.
     */
    public function releaseTemporary(Request $request)
    {
        $validated = $request->validate([
            'session_id' => 'required|string',
        ]);

        $cacheKey = 'temp_seats_' . $validated['session_id'];
        Cache::forget($cacheKey);

        return response()->json([
            'success' => true,
        ]);
    }
}
