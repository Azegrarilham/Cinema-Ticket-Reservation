<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Admin\DashboardController;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated and has admin role
        if (!Auth::guard('admin')->check() || Auth::guard('admin')->user()->role !== 'admin') {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // If user is logged in but not as admin, log them out first
            if (Auth::guard('admin')->check()) {
                Auth::guard('admin')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            return redirect()->route('admin.login')->with('error', 'You do not have access to the admin area.');
        }

        return $next($request);
    }
}
