<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        // Determine if this is a client or admin login based on the route
        $isAdmin = $request->is('admin/*');

        // If user is logged in with wrong role, force logout
        if (Auth::check()) {
            $userIsAdmin = Auth::user()->role === 'admin';

            // If admin trying to access client login or client trying to access admin login
            if (($isAdmin && !$userIsAdmin) || (!$isAdmin && $userIsAdmin)) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }
        }

        $page = $isAdmin ? 'Admin/Auth/Login' : 'Client/auth/login';

        return Inertia::render($page, [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $isAdmin = $request->is('admin/*');
        $guard = $isAdmin ? 'admin' : 'web';

        // Authenticate using the appropriate guard
        $request->authenticate($guard);

        $request->session()->regenerate();

        // Get the authenticated user from the correct guard
        $user = Auth::guard($guard)->user();

        if ($isAdmin) {
            // Check if user is already an admin or update them
            if ($user->role !== 'admin') {
                // If user is trying to login through admin page but doesn't have admin role
                // Only allow specific admin email to be set as admin
                if ($user->email === 'admin@example.com') {
                    $user->update(['role' => 'admin']);
                } else {
                    // Non-admin users can't access admin panel
                    Auth::guard($guard)->logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();
                    return redirect()->route('admin.login')->with('error', 'This account does not have admin privileges.');
                }
            }
            return redirect()->intended(route('admin.dashboard'));
        } else {
            // For client login, update role to client if not already
            if ($user->role === 'admin') {
                // Don't allow admins to login as clients
                Auth::guard($guard)->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                return redirect()->route('login')->with('error', 'Please use the client account to login here.');
            }
            // Update to client role if needed
            if ($user->role !== 'client') {
                $user->update(['role' => 'client']);
            }
            return redirect()->intended(route('home'));
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Determine the guard based on the current section
        $isAdmin = $request->is('admin/*') || (Auth::user() && Auth::user()->role === 'admin');
        $guard = $isAdmin ? 'admin' : 'web';

        Auth::guard($guard)->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Redirect admins to admin login page, others to home
        if ($isAdmin) {
            return redirect()->route('admin.login');
        }

        return redirect()->route('home');
    }
}
