<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ListTables extends Command
{
    protected $signature = 'db:list-tables';
    protected $description = 'List all tables in the database';

    public function handle()
    {
        $tables = DB::select("SELECT name FROM sqlite_master WHERE type='table'");

        $this->info('Database tables:');
        foreach ($tables as $table) {
            $this->line(" - " . $table->name);
        }

        return Command::SUCCESS;
    }
}
