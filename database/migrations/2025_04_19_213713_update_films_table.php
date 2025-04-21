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
        if (Schema::hasTable('films') &&
            !Schema::hasColumn('films', 'trailer_url') &&
            !Schema::hasColumn('films', 'cast') &&
            !Schema::hasColumn('films', 'director')) {

            Schema::table('films', function (Blueprint $table) {
                $table->string('trailer_url')->nullable();
                $table->text('cast')->nullable();
                $table->string('director')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('films') &&
            Schema::hasColumn('films', 'trailer_url') &&
            Schema::hasColumn('films', 'cast') &&
            Schema::hasColumn('films', 'director')) {

            Schema::table('films', function (Blueprint $table) {
                $table->dropColumn(['trailer_url', 'cast', 'director']);
            });
        }
    }
};
