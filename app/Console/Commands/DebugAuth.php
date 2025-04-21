<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DebugAuth extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'debug:auth';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Debug authentication sessions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Sessions in database:');
        $sessions = DB::table('sessions')->get();

        foreach ($sessions as $session) {
            $this->info('Session ID: ' . $session->id);

            if ($session->user_id) {
                $user = DB::table('users')->where('id', $session->user_id)->first();
                $this->info('User ID: ' . $session->user_id);
                $this->info('User Email: ' . $user->email);
                $this->info('User Role: ' . $user->role);
            } else {
                $this->info('Guest session');
            }

            $this->info('Last Activity: ' . date('Y-m-d H:i:s', $session->last_activity));
            $this->info('--------------------');
        }

        return Command::SUCCESS;
    }
}
