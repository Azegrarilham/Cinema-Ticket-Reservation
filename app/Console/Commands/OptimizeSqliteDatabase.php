<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PDO;

class OptimizeSqliteDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:optimize-sqlite';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Optimize SQLite database to prevent locking issues';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting SQLite database optimization...');

        if (config('database.default') !== 'sqlite') {
            $this->error('This command only works with SQLite database.');
            return 1;
        }

        try {
            // Get the database path
            $databasePath = config('database.connections.sqlite.database');
            $this->info("Database path: {$databasePath}");

            // Check if the database file exists
            if (!file_exists($databasePath)) {
                $this->info("Database file not found at: {$databasePath}. Creating a new one.");
                touch($databasePath);
            }

            // Connect to the database using PDO with immediate timeout
            $pdo = new PDO('sqlite:' . $databasePath, null, null, [
                PDO::ATTR_TIMEOUT => 2,
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);

            // Run PRAGMA commands to optimize the database
            $this->info('Running PRAGMA commands...');

            // Set synchronous mode to NORMAL
            $pdo->exec('PRAGMA synchronous = NORMAL');
            $this->info('PRAGMA synchronous = NORMAL - Set');

            // Enable WAL
            $pdo->exec('PRAGMA journal_mode = WAL');
            $this->info('PRAGMA journal_mode = WAL - Set');

            // Set busy timeout
            $pdo->exec('PRAGMA busy_timeout = 10000');
            $this->info('PRAGMA busy_timeout = 10000 - Set');

            // Set temporary storage to memory
            $pdo->exec('PRAGMA temp_store = MEMORY');
            $this->info('PRAGMA temp_store = MEMORY - Set');

            // Close the connection
            $pdo = null;

            $this->info('SQLite database optimized successfully!');
            return 0;
        } catch (\Exception $e) {
            $this->error('Error optimizing SQLite database: ' . $e->getMessage());

            // Suggest recreating the database if it's locked
            if (strpos($e->getMessage(), 'database is locked') !== false) {
                $this->warn('Database appears to be locked. You may need to:');
                $this->warn('1. Stop all PHP processes and servers');
                $this->warn('2. Delete the SQLite database file and its journal/WAL files');
                $this->warn('3. Run artisan migrate --seed to recreate the database');
            }

            return 1;
        }
    }
}
