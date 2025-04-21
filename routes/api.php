<?php

use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\SeatController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Debug endpoint for checking auth status - with robust error handling
Route::get('/auth-check', function (Request $request) {
    try {
        // Start with defaults, in case of errors
        $responseData = [
            'authenticated' => false,
            'user' => null,
            'session_active' => false,
            'session_id' => null,
        ];

        // Get session info safely
        if ($request->hasSession()) {
            $responseData['session_active'] = $request->session()->isStarted();
            $responseData['session_id'] = $request->session()->getId();
        }

        // Get auth info safely
        try {
            $responseData['authenticated'] = Auth::check();
            $user = Auth::user();

            if ($user) {
                // Make sure all relevant fields are visible
                $user->makeVisible(['id', 'name', 'email', 'role', 'created_at', 'updated_at']);
                $responseData['user'] = $user;
            }
        } catch (\Exception $authError) {
            Log::error('Auth error in auth-check', [
                'error' => $authError->getMessage(),
                'trace' => $authError->getTraceAsString()
            ]);
        }

        // Log the successful response
        Log::debug('Auth check response', [
            'user_id' => $user->id ?? null,
            'authenticated' => $responseData['authenticated'],
            'session_id' => $responseData['session_id']
        ]);

        return response()->json($responseData);
    } catch (\Exception $e) {
        Log::error('Auth check failed completely', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'error' => 'Authentication check failed',
            'message' => $e->getMessage(),
            'authenticated' => false,
            'user' => null
        ], 200); // Return 200 even on error to avoid axios errors
    }
});

// Seat Management
Route::get('/screenings/{screening}/seats', [SeatController::class, 'getSeats']);
Route::post('/seats/reserve', [SeatController::class, 'reserveTemporarily']);
Route::post('/seats/release', [SeatController::class, 'releaseTemporary']);

// Payment Processing
Route::post('/payment/initialize', [PaymentController::class, 'initialize']);
Route::post('/payment/webhook', [PaymentController::class, 'webhook']);

// Search endpoints
Route::get('/films/search', function (Request $request) {
    $query = $request->input('query');
    $films = \App\Models\Film::where('title', 'like', "%{$query}%")
        ->orWhere('description', 'like', "%{$query}%")
        ->orWhere('genre', 'like', "%{$query}%")
        ->limit(10)
        ->get(['id', 'title', 'poster_image', 'genre']);

    return response()->json(['films' => $films]);
});

Route::get('/screenings/available', function (Request $request) {
    $date = $request->input('date');
    $filmId = $request->input('film_id');

    $query = \App\Models\Screening::with('film')
        ->where('is_active', true)
        ->where('start_time', '>', now());

    if ($date) {
        $query->whereDate('start_time', $date);
    }

    if ($filmId) {
        $query->where('film_id', $filmId);
    }

    $screenings = $query->orderBy('start_time')
        ->limit(20)
        ->get();

    return response()->json(['screenings' => $screenings]);
});

// Get screening details
Route::get('/screenings/{screening}', function (App\Models\Screening $screening) {
    $screening->load(['film', 'seats']);
    return response()->json($screening);
});
