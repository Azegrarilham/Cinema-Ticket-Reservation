<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();
        $isAdminPath = $request->is('admin*');

        // Debug log for auth issues
        if ($isAdminPath) {
            Log::debug('Admin auth debug', [
                'path' => $request->path(),
                'auth_check' => Auth::check(),
                'session_id' => $request->session()->getId(),
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role
                ] : null,
            ]);
        }

        // Check if we need to force logout due to role mismatch
        if ($user && (($isAdminPath && $user->role !== 'admin') || (!$isAdminPath && $user->role === 'admin'))) {
            // This will be caught by the middleware, but we handle it here just in case
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            $user = null;
        }

        // Make sure the user data is fully loaded
        if ($user) {
            // Make all fields visible since we're in a trusted environment
            $user->makeVisible(['id', 'name', 'email', 'role', 'created_at', 'updated_at']);

            // Force refresh the user data from DB
            if ($isAdminPath) {
                try {
                    // Try to get fresh user data - extra verification for admin routes
                    $freshUser = User::find($user->id);
                    if ($freshUser) {
                        $freshUser->makeVisible(['id', 'name', 'email', 'role', 'created_at', 'updated_at']);
                        $user = $freshUser;

                        // Debug log for fresh user data
                        Log::debug('Fresh user data loaded', [
                            'user_id' => $user->id,
                            'name' => $user->name,
                            'path' => $request->path()
                        ]);
                    }
                } catch (\Exception $e) {
                    Log::error('Error refreshing user', [
                        'error' => $e->getMessage(),
                        'user_id' => $user->id
                    ]);
                }
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user,
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
