<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Show the admin profile page.
     */
    public function profile()
    {
        return Inertia::render('Admin/Profile/Index', [
            'user' => Auth::user(),
        ]);
    }

    /**
     * Show the admin settings page.
     */
    public function settings()
    {
        $admins = User::where('role', 'admin')->get();

        return Inertia::render('Admin/Settings/Index', [
            'user' => Auth::user(),
            'admins' => $admins,
        ]);
    }

    /**
     * Update the admin's profile information.
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        \Log::info('Admin profile update requested', [
            'user_id' => $user->id,
            'current_name' => $user->name,
            'current_email' => $user->email,
            'request_data' => $request->all()
        ]);

        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            ]);

            $user->fill($validated);

            if ($user->isDirty('email')) {
                $user->email_verified_at = null;
            }

            $saved = $user->save();

            \Log::info('Admin profile update completed', [
                'success' => $saved,
                'new_name' => $user->name,
                'new_email' => $user->email
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Profile updated successfully',
                    'user' => $user
                ]);
            }

            return back()->with('success', 'Profile updated successfully');
        } catch (\Exception $e) {
            \Log::error('Admin profile update failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update profile',
                    'error' => $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to update profile: ' . $e->getMessage()]);
        }
    }

    /**
     * Update the admin's password.
     */
    public function updatePassword(Request $request)
    {
        $user = Auth::user();

        \Log::info('Admin password update requested', [
            'user_id' => $user->id
        ]);

        try {
            $validated = $request->validate([
                'current_password' => ['required', 'current_password'],
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
            ]);

            $user->update([
                'password' => Hash::make($validated['password']),
            ]);

            \Log::info('Admin password updated successfully', [
                'user_id' => $user->id
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Password updated successfully'
                ]);
            }

            return back()->with('success', 'Password updated successfully');
        } catch (\Exception $e) {
            \Log::error('Admin password update failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update password',
                    'error' => $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to update password: ' . $e->getMessage()]);
        }
    }

    /**
     * Create a new admin user.
     */
    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'admin',
        ]);

        return back()->with('success', 'Administrator added successfully');
    }
}
