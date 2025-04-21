<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;

class OAuthController extends Controller
{
    /**
     * Redirect the user to the provider authentication page.
     *
     * @param string $provider
     * @return \Illuminate\Http\RedirectResponse
     */
    public function redirect($provider)
    {
        // Validate that the provider is one we support
        if (!in_array($provider, ['google', 'twitter'])) {
            return redirect()->route('login')
                ->withErrors(['provider' => 'The selected provider is not supported.']);
        }

        return Socialite::driver($provider)->redirect();
    }

    /**
     * Handle provider callback and authenticate the user.
     *
     * @param string $provider
     * @return \Illuminate\Http\RedirectResponse
     */
    public function callback($provider)
    {
        try {
            // Get user data from provider
            $providerUser = Socialite::driver($provider)->user();
            
            // Find user by provider ID and provider name
            $user = User::where([
                'provider_id' => $providerUser->getId(),
                'provider_name' => $provider
            ])->first();
            
            // If user exists, log them in
            if ($user) {
                Auth::login($user, true);
                return redirect()->intended(route('dashboard'));
            }
            
            // Check if user exists with the same email
            if ($providerUser->getEmail()) {
                $existingUser = User::where('email', $providerUser->getEmail())->first();
                
                if ($existingUser) {
                    // Update the existing user's provider details and log them in
                    $existingUser->update([
                        'provider_id' => $providerUser->getId(),
                        'provider_name' => $provider,
                    ]);
                    
                    Auth::login($existingUser, true);
                    return redirect()->intended(route('dashboard'));
                }
            }
            
            // If user doesn't exist, store OAuth data in session and redirect to complete profile
            session()->put('oauth_user', [
                'provider_id' => $providerUser->getId(),
                'provider_name' => $provider,
                'name' => $providerUser->getName(),
                'email' => $providerUser->getEmail(),
                'avatar' => $providerUser->getAvatar(),
            ]);
            
            return redirect()->route('oauth.complete-profile.show');
            
        } catch (\Exception $e) {
            return redirect()->route('login')
                ->withErrors(['oauth' => 'An error occurred during authentication. Please try again.']);
        }
    }

    /**
     * Show the form to complete the user profile after OAuth login
     */
    public function showCompleteProfile()
    {
        // Ensure we have oauth data in session
        if (!session()->has('oauth_user')) {
            return redirect()->route('login');
        }
        
        $oauthUser = session()->get('oauth_user');
        
        return Inertia::render('auth/complete-profile', [
            'oauth_user' => $oauthUser,
        ]);
    }
    
    /**
     * Complete the user profile after OAuth login
     */
    public function completeProfile(Request $request)
    {
        // Validate the request
        $request->validate([
            'username' => 'required|string|max:255|unique:users|alpha_dash',
        ]);
        
        // Ensure we have oauth data in session
        if (!session()->has('oauth_user')) {
            return redirect()->route('login')
                ->withErrors(['oauth' => 'Your session has expired. Please try logging in again.']);
        }
        
        $oauthUser = session()->get('oauth_user');
        
        // Create the user
        $user = User::create([
            'name' => $oauthUser['name'],
            'username' => $request->username,
            'email' => $oauthUser['email'],
            'password' => Hash::make(Str::random(16)), // Random password for OAuth users
            'provider_id' => $oauthUser['provider_id'],
            'provider_name' => $oauthUser['provider_name'],
            'profile_photo' => $oauthUser['avatar'] ?? null,
        ]);
        
        event(new Registered($user));
        
        // Remove oauth data from session
        session()->forget('oauth_user');
        
        // Log in the user
        Auth::login($user, true);
        
        return redirect()->intended(route('dashboard'));
    }
}
