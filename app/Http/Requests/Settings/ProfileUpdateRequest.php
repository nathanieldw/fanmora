<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'username' => ['nullable', 'string', 'max:30', 'regex:/^[a-zA-Z0-9_.-]*$/', Rule::unique(User::class)->ignore($this->user()->id)],
            'bio' => ['nullable', 'string', 'max:5000'],
            'website' => ['nullable', 'string', 'url', 'max:255'],
            'twitter_username' => ['nullable', 'string', 'max:30'],
            'instagram_username' => ['nullable', 'string', 'max:30'],
            'profile_photo' => ['nullable', 'image', 'max:2048'],

            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            
            // Subscription settings
            'is_subscription_required' => ['boolean'],
            'subscription_plans' => ['required_if:is_subscription_required,true', 'array', 'min:1'],
            'subscription_plans.*.interval' => ['required_with:subscription_plans', 'string', 'in:monthly,quarterly,biannually,yearly'],
            'subscription_plans.*.price' => ['required_with:subscription_plans', 'numeric', 'min:0', 'max:999.99'],
            'subscription_plans.*.is_default' => ['nullable', 'boolean'],
            
            'trial_option' => ['array'],
            'trial_option.enabled' => ['boolean'],
            'trial_option.duration_days' => ['required_if:trial_option.enabled,true', 'integer', 'min:1', 'max:90'],
            'trial_option.price' => ['required_if:trial_option.enabled,true', 'numeric', 'min:0', 'max:999.99'],
        ];
    }
}
