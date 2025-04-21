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
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->unique()->nullable();
$table->text('bio')->nullable();
$table->string('profile_photo')->nullable();
$table->string('cover_photo')->nullable();
$table->boolean('is_creator')->default(false);
$table->decimal('subscription_price', 8, 2)->nullable();
$table->string('stripe_account_id')->nullable();
$table->string('stripe_customer_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->unique()->nullable();
$table->text('bio')->nullable();
$table->string('profile_photo')->nullable();
$table->string('cover_photo')->nullable();
$table->boolean('is_creator')->default(false);
$table->decimal('subscription_price', 8, 2)->nullable();
$table->string('stripe_account_id')->nullable();
$table->string('stripe_customer_id')->nullable();
        });
    }
};
