<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WelcomeController;

Route::get('/', [WelcomeController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [PostController::class, 'index'])->name('dashboard');

    // Explore and Search
    Route::get('explore', [PostController::class, 'explore'])->name('explore');

    // Message Routes
    Route::get('messages', [MessageController::class, 'index'])->name('messages.index');
    Route::get('messages/{user}', [MessageController::class, 'show'])->name('messages.show');
    Route::post('messages/{user}', [MessageController::class, 'store'])->name('messages.store');
    Route::post('messages/greeting/set', [MessageController::class, 'setDefaultGreeting'])->name('messages.greeting.set');
    Route::delete('messages/greeting', [MessageController::class, 'deleteDefaultGreeting'])->name('messages.greeting.delete');

    Route::get('posts/create', function () {
        return Inertia::render('post/create');
    })->name('post.create');

    // Assuming profile.show takes a username (adjust model/key if needed)
    Route::get('profile/{user:username}', function (App\Models\User $user) {
        // Pass user data to the profile page
        return Inertia::render('profile/show', ['profileUser' => $user]);
    })->name('profile.show');

    // Post Routes
    Route::post('posts', [PostController::class, 'store'])->name('post.store');
    Route::get('posts/{post}', [PostController::class, 'show'])->name('posts.show');
    Route::get('api/posts/{post}/with-recommendations', [PostController::class, 'showWithRecommendations'])->name('api.posts.recommendations');

    // Post Interaction Routes
    Route::post('posts/{id}/like', [PostController::class, 'like'])->name('post.like');
    Route::post('posts/{id}/save', [PostController::class, 'save'])->name('post.save');
    Route::post('posts/{id}/comment', [PostController::class, 'comment'])->name('post.comment');

    // User Follow Routes
    Route::post('users/{user}/follow', [FollowController::class, 'toggle'])->name('users.follow');
    // Place the general route before the specific ones with parameters
    Route::get('api/users/random', [UserController::class, 'getRandomUsers'])->name('api.users.random');
    Route::get('api/users/{user}/follow-status', [FollowController::class, 'status'])->name('api.users.follow.status');
    Route::get('api/users/{user}/subscription-plans', [App\Http\Controllers\SubscriptionController::class, 'getPlans'])->name('api.users.subscription.plans');
    Route::get('api/users/{user}/posts', [App\Http\Controllers\PostController::class, 'getUserPosts'])->name('api.users.posts');
    // Place this route after all routes with parameters to prevent conflicts
    Route::get('api/saved-posts', [App\Http\Controllers\PostController::class, 'getSavedPosts'])->name('api.saved-posts');

    // Story Routes
    Route::prefix('api/stories')->group(function () {
        Route::get('/', [App\Http\Controllers\StoryController::class, 'index'])->name('api.stories.index');
        Route::post('/', [App\Http\Controllers\StoryController::class, 'store'])->name('api.stories.store');
        Route::post('/{story}/view', [App\Http\Controllers\StoryController::class, 'markAsViewed'])->name('api.stories.view');
        Route::delete('/{story}', [App\Http\Controllers\StoryController::class, 'destroy'])->name('api.stories.destroy');
    });

    // Subscription Routes
    Route::get('subscriptions', [App\Http\Controllers\SubscriptionController::class, 'index'])->name('subscriptions');
    Route::get('subscribe/{creator}', [App\Http\Controllers\SubscriptionController::class, 'create'])->name('subscription.create');
    Route::post('subscribe/{creator}', [App\Http\Controllers\SubscriptionController::class, 'store'])->name('subscription.store');
    Route::get('subscribe/callback/{subscription}', [App\Http\Controllers\SubscriptionController::class, 'handleCallback'])->name('subscription.callback');
    Route::get('subscribe/free-callback/{subscription}', [App\Http\Controllers\SubscriptionController::class, 'handleFreeCallback'])->name('subscription.free_callback');
    Route::post('subscribe/webhook', [App\Http\Controllers\SubscriptionController::class, 'handleWebhook'])->name('subscription.webhook');

    // Notifications
    Route::get('notifications', [App\Http\Controllers\NotificationController::class, 'index'])->name('notifications');
    Route::post('notifications/{notification}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('notifications/read-all', [App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
