import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState, useRef, useEffect } from 'react';
import axios from 'axios';
import MDEditor from '@uiw/react-md-editor';
import '@/components/markdown-styles.css';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Globe, Twitter, Instagram, Link2, Plus, Trash2, CreditCard, Clock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type SubscriptionPlan = {
    id?: string;
    interval: 'monthly' | 'quarterly' | 'biannually' | 'yearly';
    price: number;
    is_default?: boolean;
};

type TrialOption = {
    enabled: boolean;
    duration_days: number;
    price: number;
};

type ProfileForm = {
    name: string;
    email: string;
    username: string;
    bio: string;
    website: string;
    twitter_username: string;
    instagram_username: string;
    profile_photo: File | null;
    // Subscription settings
    is_subscription_required: boolean;
    subscription_plans: SubscriptionPlan[];
    trial_option: TrialOption;
}

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    // Ensure photoPreview is strictly a string or null
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Safe theme detection for SSR compatibility
    const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');
    
    // Update theme when component mounts
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isDarkMode = document.documentElement.classList.contains('dark');
            setColorMode(isDarkMode ? 'dark' : 'light');
        }
    }, []);

    // Extract user subscription data with proper type handling
    const userSubscriptionPlans: SubscriptionPlan[] = Array.isArray(auth.user.subscription_plans) 
        ? auth.user.subscription_plans 
        : [{ interval: 'monthly', price: 4.99, is_default: true }, { interval: 'yearly', price: 49.99 }];
    
    const userTrialOption: TrialOption = auth.user.trial_option && typeof auth.user.trial_option === 'object'
        ? auth.user.trial_option as TrialOption
        : { enabled: false, duration_days: 7, price: 0 };
    
    // Use proper type for form initialization with recentlySuccessful as state since we're handling manually
    const { data, setData, errors: formErrors, processing } = useForm<ProfileForm>({
        name: auth.user.name,
        email: auth.user.email,
        username: auth.user.username || '',
        bio: auth.user.bio || '',
        website: typeof auth.user.website === 'string' ? auth.user.website : '',
        twitter_username: typeof auth.user.twitter_username === 'string' ? auth.user.twitter_username : '',
        instagram_username: typeof auth.user.instagram_username === 'string' ? auth.user.instagram_username : '',
        profile_photo: null,
        // Subscription settings (with defaults)
        is_subscription_required: Boolean(auth.user.is_subscription_required),
        subscription_plans: userSubscriptionPlans,
        trial_option: userTrialOption,
    });
    
    // Manage errors and success state ourselves since we're using axios directly
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        // Reset any existing errors
        setErrors({});

        // Make sure required fields are explicitly sent and not empty
        if (!data.name?.trim()) {
            setData('name', auth.user.name || '');
        }
        if (!data.email?.trim()) {
            setData('email', auth.user.email || '');
        }

        // Create FormData manually to ensure proper data submission
        const formData = new FormData();
        
        // Add all form fields explicitly
        formData.append('name', data.name || '');
        formData.append('email', data.email || '');
        formData.append('username', data.username || '');
        formData.append('bio', data.bio || '');
        formData.append('website', data.website || '');
        formData.append('twitter_username', data.twitter_username || '');
        formData.append('instagram_username', data.instagram_username || '');
        
        // Handle profile photo separately
        if (data.profile_photo instanceof File) {
            formData.append('profile_photo', data.profile_photo);
        }
        
        // Add subscription fields
        formData.append('is_subscription_required', data.is_subscription_required ? '1' : '0');
        
        // Handle subscription plans
        if (Array.isArray(data.subscription_plans)) {
            data.subscription_plans.forEach((plan, index) => {
                formData.append(`subscription_plans[${index}][interval]`, plan.interval);
                formData.append(`subscription_plans[${index}][price]`, String(plan.price));
                formData.append(`subscription_plans[${index}][is_default]`, plan.is_default ? '1' : '0');
            });
        }
        
        // Handle trial options
        if (data.trial_option) {
            formData.append('trial_option[enabled]', data.trial_option.enabled ? '1' : '0');
            formData.append('trial_option[duration_days]', String(data.trial_option.duration_days));
            formData.append('trial_option[price]', String(data.trial_option.price));
        }

        // Use axios directly instead of Inertia to ensure proper FormData handling
        axios.post(route('profile.update'), formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-HTTP-Method-Override': 'PATCH' // Override for servers that don't support PATCH with multipart
            }
        }).then((response: any) => {
            if (photoPreview) {
                setPhotoPreview(null);
            }
            // Show success message
            setRecentlySuccessful(true);
            setTimeout(() => setRecentlySuccessful(false), 2000);
        }).catch((error: any) => {
            // Reset success message if there was an error
            setRecentlySuccessful(false);
            
            // Handle validation errors if they exist in the response
            if (error.response && error.response.data && error.response.data.errors) {
                // Set errors manually since we're bypassing Inertia's handling
                const validationErrors = error.response.data.errors;
                const updatedErrors: Record<string, string> = {};
                
                for (const [key, value] of Object.entries(validationErrors)) {
                    updatedErrors[key] = Array.isArray(value) ? value[0] as string : value as string;
                }
                
                // Update the form errors state
                setErrors(updatedErrors);
            } else {
                // Show generic error if not a validation error
                setErrors({
                    form: 'An error occurred while saving your profile. Please try again.'
                });
            }
        });
    };
    
    const selectNewPhoto = () => {
        fileInputRef.current?.click();
    };
    
    const updatePhotoPreview = () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) return;
        
        // Use a type assertion to satisfy TypeScript
        setData('profile_photo', file as any);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            // Ensure we're getting a string result from the FileReader
            if (e.target && typeof e.target.result === 'string') {
                setPhotoPreview(e.target.result);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <AppLayout user={auth.user}>
            <Head title="Edit Profile" />
            
            <div className="pt-6 pb-12 w-full max-w-[600px] mx-auto px-4 sm:px-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold">Edit Profile</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Update your profile information and account settings</p>
                </div>
                
                <Tabs defaultValue="info" className="w-full">
                        <TabsList className="w-full border-t border-b py-2 justify-center mb-8">
                            <TabsTrigger value="info">Profile Information</TabsTrigger>
                            <TabsTrigger value="subscription">Subscription</TabsTrigger>
                            <TabsTrigger value="account">Account</TabsTrigger>
                        </TabsList>
                        
                        <form onSubmit={submit} className="space-y-6" encType="multipart/form-data" id="profile-form">
                            <TabsContent value="info" className="space-y-6">
                                {/* Profile Photo */}
                                <div className="flex items-center gap-6 mb-6">
                                    <div className="relative flex items-center gap-6">
                                        <Avatar className="h-20 w-20 border border-gray-200 dark:border-gray-800">
                                            {photoPreview ? (
                                                <AvatarImage src={photoPreview} alt={data.name || ''} className="object-cover" />
                                            ) : auth.user.profile_photo_url ? (
                                                <AvatarImage 
                                                    src={typeof auth.user.profile_photo_url === 'string' ? auth.user.profile_photo_url : ''} 
                                                    alt={auth.user.name} 
                                                    className="object-cover" 
                                                />
                                            ) : (
                                                <AvatarFallback>
                                                    {auth.user.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                        <button 
                                            type="button"
                                            className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white dark:border-gray-800 hover:bg-blue-600 transition-colors"
                                            onClick={selectNewPhoto}
                                            aria-label="Change profile photo"
                                            title="Change profile photo"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </button>
                                        <input 
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={updatePhotoPreview}
                                            aria-label="Upload profile photo"
                                            title="Upload profile photo"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{auth.user.username || auth.user.name}</h3>
                                        <Button 
                                            type="button" 
                                            variant="link" 
                                            className="p-0 h-auto text-blue-500"
                                            onClick={selectNewPhoto}
                                        >
                                            Change profile photo
                                        </Button>
                                    </div>
                                </div>
                                {/* Name and Username Fields */}
                                <div className="grid gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                            autoComplete="name"
                                            className="h-10 px-3 rounded-md"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Help people discover your account by using the name you're known by.</p>
                                        <InputError className="mt-1" message={errors.name} />
                                    </div>
                                    
                                    <div className="grid gap-2">
                                        <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                                        <Input
                                            id="username"
                                            type="text"
                                            value={data.username}
                                            onChange={(e) => setData('username', e.target.value)}
                                            required
                                            className="h-10 px-3 rounded-md"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">This is your unique identifier on Fanmora.</p>
                                        <InputError className="mt-1" message={errors.username} />
                                    </div>
                                </div>
                                
                                {/* Bio Field - Markdown Editor */}
                                <div className="grid gap-4">
                                    <div>
                                        <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">A brief description that appears on your profile. Supports markdown formatting.</p>
                                    </div>
                                    <div className="w-full" data-color-mode={colorMode}>
                                        <MDEditor
                                            value={data.bio}
                                            onChange={(value) => setData('bio', value || '')}
                                            preview="edit"
                                            height={200}
                                            visibleDragbar={false}
                                            hideToolbar={false}
                                            enableScroll={true}
                                            className="markdown-editor"
                                        />
                                    </div>
                                    <InputError className="mt-1" message={errors.bio} />
                                </div>
                                
                                {/* Social Links */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">External Links</h3>
                                    
                                    <div className="grid gap-3">
                                        <div className="flex items-center">
                                            <div className="w-10">
                                                <Globe className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <Input
                                                id="website"
                                                type="text"
                                                value={data.website}
                                                onChange={(e) => setData('website', e.target.value)}
                                                placeholder="Your website URL"
                                                className="h-10 px-3 rounded-md"
                                            />
                                        </div>
                                        
                                        <div className="flex items-center">
                                            <div className="w-10">
                                                <Twitter className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <Input
                                                id="twitter_username"
                                                type="text"
                                                value={data.twitter_username}
                                                onChange={(e) => setData('twitter_username', e.target.value)}
                                                placeholder="Twitter username"
                                                className="h-10 px-3 rounded-md"
                                            />
                                        </div>
                                        
                                        <div className="flex items-center">
                                            <div className="w-10">
                                                <Instagram className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <Input
                                                id="instagram_username"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.instagram_username}
                                                onChange={(e) => setData('instagram_username', e.target.value)}
                                                placeholder="Instagram username"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            
                            {/* Subscription Settings */}
                            <TabsContent value="subscription" className="space-y-6">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Subscription Settings</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Configure how others can subscribe to your content.</p>
                                    </div>
                                    
                                    <div className="flex items-center justify-between border-b pb-4">
                                        <div>
                                            <Label htmlFor="subscription-required" className="text-base font-medium">Require Payment for Follow</Label>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Users will need to pay a subscription fee to follow you.</p>
                                        </div>
                                        <Switch
                                            id="subscription-required"
                                            checked={data.is_subscription_required}
                                            onCheckedChange={(checked) => setData('is_subscription_required', checked)}
                                        />
                                    </div>
                                    
                                    {/* Subscription Plans */}
                                    <div className="space-y-4 mt-6">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-base font-medium">Subscription Plans</h4>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => {
                                                    const newPlans = [...data.subscription_plans, { 
                                                        interval: 'monthly' as const, 
                                                        price: 4.99 
                                                    }];
                                                    setData('subscription_plans', newPlans);
                                                }}
                                                className="h-8"
                                            >
                                                <Plus className="h-4 w-4 mr-1" /> Add Plan
                                            </Button>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            {Array.isArray(data.subscription_plans) && data.subscription_plans.map((plan: SubscriptionPlan, index: number) => (
                                                <div key={`plan-${index}`} className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-md">
                                                    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3">
                                                        <div className="space-y-1">
                                                            <Label htmlFor={`plan-interval-${index}`} className="text-xs">Interval</Label>
                                                            <select
                                                                id={`plan-interval-${index}`}
                                                                className="w-full p-2 rounded-md border border-gray-200 dark:border-gray-700 text-sm"
                                                                value={plan.interval}
                                                                aria-label={`Subscription interval for plan ${index + 1}`}
                                                                onChange={(e) => {
                                                                    const newPlans = [...data.subscription_plans];
                                                                    newPlans[index].interval = e.target.value as 'monthly' | 'quarterly' | 'biannually' | 'yearly';
                                                                    setData('subscription_plans', newPlans);
                                                                }}
                                                            >
                                                                <option value="monthly">Monthly</option>
                                                                <option value="quarterly">Quarterly (3 months)</option>
                                                                <option value="biannually">Biannually (6 months)</option>
                                                                <option value="yearly">Yearly</option>
                                                            </select>
                                                        </div>
                                                        
                                                        <div className="space-y-1">
                                                            <Label htmlFor={`plan-price-${index}`} className="text-xs">Price (€)</Label>
                                                            <Input
                                                                id={`plan-price-${index}`}
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                value={plan.price}
                                                                onChange={(e) => {
                                                                    const newPlans = [...data.subscription_plans];
                                                                    newPlans[index].price = parseFloat(e.target.value);
                                                                    setData('subscription_plans', newPlans);
                                                                }}
                                                                className="h-9"
                                                            />
                                                        </div>
                                                        
                                                        <div className="flex items-center space-x-2 pt-6">
                                                            <input
                                                                type="radio"
                                                                id={`plan-default-${index}`}
                                                                name="default-plan"
                                                                aria-label={`Set plan ${index + 1} as default`}
                                                                checked={plan.is_default}
                                                                onChange={() => {
                                                                    const newPlans = [...data.subscription_plans].map((p, i) => ({
                                                                        ...p,
                                                                        is_default: i === index
                                                                    }));
                                                                    setData('subscription_plans', newPlans);
                                                                }}
                                                                className="h-4 w-4"
                                                            />
                                                            <Label htmlFor={`plan-default-${index}`} className="text-xs">Default</Label>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (Array.isArray(data.subscription_plans) && data.subscription_plans.length > 1) {
                                                                const newPlans = [...data.subscription_plans];
                                                                newPlans.splice(index, 1);
                                                                // Ensure at least one plan has is_default=true
                                                                if (plan.is_default && newPlans.length > 0) {
                                                                    newPlans[0].is_default = true;
                                                                }
                                                                setData('subscription_plans', newPlans);
                                                            }
                                                        }}
                                                        disabled={!Array.isArray(data.subscription_plans) || data.subscription_plans.length <= 1}
                                                        className="text-gray-500 h-8 hover:text-red-500"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Trial Options */}
                                    <div className="mt-8 space-y-4 border-t border-gray-200 dark:border-gray-800 pt-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-base font-medium flex items-center"> 
                                                    <Clock className="h-4 w-4 mr-1" /> Trial Period
                                                </h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Offer a discounted trial to new subscribers.</p>
                                            </div>
                                            <Switch
                                                id="trial-enabled"
                                                checked={data.trial_option && data.trial_option.enabled || false}
                                                onCheckedChange={(checked: boolean) => {
                                                    setData('trial_option', {
                                                        duration_days: data.trial_option?.duration_days || 7,
                                                        price: data.trial_option?.price || 0,
                                                        enabled: checked
                                                    });
                                                }}
                                            />
                                        </div>
                                        
                                        {data.trial_option && data.trial_option.enabled && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                                                <div className="space-y-1">
                                                    <Label htmlFor="trial-duration" className="text-sm">Duration (days)</Label>
                                                    <Input
                                                        id="trial-duration"
                                                        type="number"
                                                        min="1"
                                                        max="90"
                                                        value={data.trial_option?.duration_days || 7}
                                                        onChange={(e) => {
                                                            setData('trial_option', {
                                                                enabled: data.trial_option?.enabled || false,
                                                                price: data.trial_option?.price || 0,
                                                                duration_days: parseInt(e.target.value)
                                                            });
                                                        }}
                                                        className="h-9"
                                                    />
                                                </div>
                                                
                                                <div className="space-y-1">
                                                    <Label htmlFor="trial-price" className="text-sm">Trial Price (€)</Label>
                                                    <Input
                                                        id="trial-price"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={data.trial_option?.price || 0}
                                                        onChange={(e) => {
                                                            setData('trial_option', {
                                                                enabled: data.trial_option?.enabled || false,
                                                                duration_days: data.trial_option?.duration_days || 7,
                                                                price: parseFloat(e.target.value)
                                                            });
                                                        }}
                                                        className="h-9"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Payment Processing Information */}
                                    <div className="mt-8 p-4 border border-gray-200 dark:border-gray-800 rounded-md bg-gray-50 dark:bg-gray-800/40">
                                        <div className="flex items-start gap-3">
                                            <CreditCard className="h-5 w-5 text-blue-500 mt-0.5" /> 
                                            <div>
                                                <h5 className="text-sm font-medium">Payment Processing with Mollie</h5>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    All payments are processed securely through Mollie. Even for free subscriptions, users will need to connect a credit card with a €0.00 authorization for future payments. Your payout details can be configured in the Payment Settings tab.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="account" className="space-y-6">
                                {/* Email Field */}
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        autoComplete="username"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Used for notifications and account recovery.</p>
                                    <InputError className="mt-1" message={errors.email} />
                                </div>

                                {/* Email Verification Section */}
                                {mustVerifyEmail && auth.user.email_verified_at === null && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                                        <p className="text-sm text-blue-800 dark:text-blue-300">
                                            Your email address is unverified.{' '}
                                            <Link
                                                href={route('verification.send')}
                                                method="post"
                                                as="button"
                                                className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
                                            >
                                                Click here to resend the verification email.
                                            </Link>
                                        </p>

                                        {status === 'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                                A new verification link has been sent to your email address.
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {/* Account Deletion */}
                                <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-6">
                                    <DeleteUser />
                                </div>
                            </TabsContent>
                            
                            {/* Submit Button (Always visible) */}
                            <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-800 mt-8">
                                <Button type="submit" disabled={processing} className="bg-blue-500 hover:bg-blue-600">Save Changes</Button>

                                {errors.form && (
                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.form}</p>
                                )}
                                
                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-green-600 dark:text-green-400">Profile saved successfully!</p>
                                </Transition>
                            </div>
                        </form>
                    </Tabs>
            </div>
        </AppLayout>
    );
}
