<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateAdminUser extends Command
{

    protected $signature = 'admin:create';

    protected $description = 'Create a new admin user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = 'admin@example.com';
        $name = 'Admin User';
        $password = 'password123';

        // Check if user with this email already exists
        $existingUser = User::where('email', $email)->first();

        if ($existingUser) {
            // Update existing user to admin role
            $existingUser->update([
                'role' => 'admin',
                'password' => Hash::make($password),
            ]);

            $this->info("Admin user updated: {$email} with password: {$password}");
            return;
        }

        // Create new admin user
        User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $this->info("Admin user created: {$email} with password: {$password}");
    }
}
