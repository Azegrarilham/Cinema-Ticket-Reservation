<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Personal access tokens already added in another migration
        // Left empty to avoid duplicate migration
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op since we're not making changes
    }
};
