<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UpdateAdminUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Update all users with role='admin' to have is_admin=1
        DB::table('users')
            ->where('role', 'admin')
            ->update(['is_admin' => 1]);

        // Optionally, ensure all non-admin users have is_admin=0
        DB::table('users')
            ->where('role', '!=', 'admin')
            ->update(['is_admin' => 0]);

        $this->command->info('Admin users updated successfully!');
    }
}
