<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FilmController as AdminFilmController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\ReservationController as AdminReservationController;
use App\Http\Controllers\Admin\ScreeningController;
use App\Http\Controllers\FilmController;
use App\Http\Controllers\ReservationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Film;
use App\Models\Screening;
use App\Models\Reservation;
use App\Models\Payment;

// HIGHEST PRIORITY ROUTE - Direct access to admin dashboard URL
// Still use web middleware for Inertia to work properly, but bypass auth middleware
Route::middleware(['web'])->get('/admin/dashboard', function() {
    if (!Auth::guard('admin')->check() || Auth::guard('admin')->user()->role !== 'admin') {
        return redirect()->route('admin.login');
    }

    // Render the admin dashboard directly
    return Inertia::render('Admin/Dashboard/Index', [
        'stats' => [
            'films_count' => Film::count(),
            'screenings_count' => Screening::count(),
            'reservations_count' => Reservation::count(),
            'revenue' => floatval(Payment::where('status', 'completed')->sum('amount')),
            'recent_growth' => [
                'films' => Film::where('created_at', '>', now()->subDays(30))->count(),
                'screenings' => Screening::where('created_at', '>', now()->subDays(30))->count(),
                'reservations' => Reservation::where('created_at', '>', now()->subDays(30))->count(),
                'revenue' => floatval(Payment::where('status', 'completed')
                    ->where('created_at', '>', now()->subDays(30))
                    ->sum('amount')),
            ],
        ],
        'upcomingScreenings' => Screening::with('film')
            ->where('start_time', '>', now())
            ->where('is_active', true)
            ->orderBy('start_time')
            ->limit(5)
            ->get(),
        'recentReservations' => Reservation::with(['screening.film', 'user'])
            ->latest()
            ->limit(5)
            ->get(),
        'popularFilms' => Film::withCount('reservations')
            ->orderByDesc('reservations_count')
            ->limit(5)
            ->get(),
    ]);
});

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Apply client role check to all public and client routes
Route::middleware(['web', \App\Http\Middleware\EnsureUserIsClient::class])->group(function () {
    // Public Routes
    Route::get('/', [FilmController::class, 'home'])->name('home');
    Route::get('/films', [FilmController::class, 'index'])->name('films.index');
    Route::get('/films/{film}', [FilmController::class, 'show'])->name('films.show');

    // Reservation Search Route
    Route::get('/find-reservation', [ReservationController::class, 'searchForm'])->name('reservations.search');
    Route::post('/find-reservation', [ReservationController::class, 'search'])->name('reservations.search.post');

    // Reservation Routes
    Route::get('/screenings/{screening}/seats', [ReservationController::class, 'seatSelection'])
        ->name('reservations.seat-selection');
    Route::post('/screenings/{screening}/reservations', [ReservationController::class, 'store'])
        ->name('reservations.store');
    Route::get('/reservations/{reservation}/payment', [ReservationController::class, 'payment'])
        ->name('reservations.payment');
    Route::post('/reservations/{reservation}/payment', [ReservationController::class, 'processPayment'])
        ->name('reservations.process-payment');
    Route::get('/reservations/{reservation}/confirmation', [ReservationController::class, 'confirmation'])
        ->name('reservations.confirmation');
    Route::get('/reservations/{reservation}/download', [ReservationController::class, 'downloadTicket'])
        ->name('reservations.download-ticket');

    // Authenticated Client Routes
    Route::middleware(['auth:web', 'verified'])->group(function () {
        // Account routes
        Route::get('/account', [App\Http\Controllers\AccountController::class, 'index'])->name('account.index');
        Route::get('/account/settings', [App\Http\Controllers\AccountController::class, 'settings'])->name('account.settings');
        Route::put('/account/profile', [App\Http\Controllers\AccountController::class, 'updateProfile'])->name('account.profile.update');
        Route::put('/account/password', [App\Http\Controllers\AccountController::class, 'updatePassword'])->name('account.password.update');

        // Reservation routes
        Route::get('/account/reservations', [ReservationController::class, 'userReservations'])
            ->name('account.reservations');
        Route::get('/account/reservations/{reservation}', [ReservationController::class, 'show'])
            ->name('account.reservations.show');
    });
});

// Ensure dashboard is never accessible
Route::get('/dashboard', function() {
    abort(404);
});

// Admin Routes
// Show admin dashboard at /admin if authenticated as admin, otherwise redirect to admin login
Route::get('/admin', function() {
    if (Auth::guard('admin')->check() && Auth::guard('admin')->user()->role === 'admin') {
        return app()->call([new DashboardController, 'index']);
    }
    return redirect()->route('admin.login');
})->name('admin.dashboard');

// Admin Routes
Route::prefix('admin')->name('admin.')->middleware(['auth:admin', \App\Http\Middleware\EnsureUserIsAdmin::class])->group(function () {
    // Admin Profile and Settings
    Route::get('/profile', [App\Http\Controllers\Admin\ProfileController::class, 'profile'])->name('profile');
    Route::get('/settings', [App\Http\Controllers\Admin\ProfileController::class, 'settings'])->name('settings');
    Route::put('/profile/update', [App\Http\Controllers\Admin\ProfileController::class, 'updateProfile'])->name('profile.update');
    Route::put('/password/update', [App\Http\Controllers\Admin\ProfileController::class, 'updatePassword'])->name('password.update');
    Route::post('/settings/users', [App\Http\Controllers\Admin\ProfileController::class, 'storeUser'])->name('users.store');

    // Films
    Route::resource('films', AdminFilmController::class);

    // OMDB API routes
    Route::post('/films/omdb/search', [AdminFilmController::class, 'searchOmdb'])->name('films.omdb.search');
    // This route expects imdb_id as a route parameter
    Route::get('/films/omdb/{imdb_id}/details', [AdminFilmController::class, 'getOmdbFilmDetails'])->name('films.omdb.details');
    Route::post('/films/omdb/import', [AdminFilmController::class, 'importFromOmdb'])->name('films.omdb.import');

    // Screenings
    Route::resource('screenings', ScreeningController::class);
    Route::get('/films/{film}/screenings', [ScreeningController::class, 'filmScreenings'])
        ->name('films.screenings');
    Route::post('/screenings/{screening}/repair-seats', [ScreeningController::class, 'repairSeats'])
        ->name('screenings.repair-seats');

    // Reservations
    Route::get('/reservations', [AdminReservationController::class, 'index'])->name('reservations.index');
    Route::get('/reservations/{reservation}', [AdminReservationController::class, 'show'])->name('reservations.show');
    Route::put('/reservations/{reservation}/status', [AdminReservationController::class, 'updateStatus'])
        ->name('reservations.update-status');
    Route::delete('/reservations/{reservation}', [AdminReservationController::class, 'destroy'])
        ->name('reservations.destroy');

    // Reports
    Route::get('/reports/films', [ReportController::class, 'films'])->name('reports.films');
    Route::get('/reports/revenue', [ReportController::class, 'revenue'])->name('reports.revenue');
    Route::get('/reports/screenings', [ReportController::class, 'screenings'])->name('reports.screenings');
});

// Debug route for auth state
Route::get('/debug/auth', function () {
    $user = auth()->user();
    return [
        'is_authenticated' => auth()->check(),
        'user' => $user ? [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role
        ] : null,
        'user_session' => session()->all(),
    ];
});

require __DIR__.'/auth.php';

// Add a test route at the very end of the file
Route::get('/test-mail/{email}/{reservation_id?}', function($email, $reservation_id = null) {
    if ($reservation_id) {
        $reservation = App\Models\Reservation::findOrFail($reservation_id);
        \Illuminate\Support\Facades\Notification::route('mail', $email)
            ->notify(new App\Notifications\TicketConfirmationNotification($reservation));
        return "Ticket email sent to {$email} for reservation #{$reservation_id}";
    } else {
        \Illuminate\Support\Facades\Mail::raw('This is a test email from your CineVerse application.', function ($message) use ($email) {
            $message->to($email)
                ->subject('CineVerse Test Email');
        });
        return "Test email sent to {$email}";
    }
});
