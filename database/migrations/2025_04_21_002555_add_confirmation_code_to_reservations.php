<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Reservation;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('confirmation_code')->nullable()->unique()->after('reservation_code');
        });

        // Fill in confirmation codes for existing reservations
        $reservations = Reservation::whereNull('confirmation_code')->get();
        foreach ($reservations as $reservation) {
            $reservation->confirmation_code = 'CONF-' . strtoupper(Str::random(8));
            $reservation->save();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn('confirmation_code');
        });
    }
};
