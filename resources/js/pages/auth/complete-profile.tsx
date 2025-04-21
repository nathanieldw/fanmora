import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type CompleteProfileForm = {
    username: string;
};

interface Props {
    oauth_user: {
        name: string;
        email: string;
        provider_name: string;
        avatar?: string;
    };
}

export default function CompleteProfile({ oauth_user }: Props) {
    const { data, setData, post, processing, errors } = useForm<CompleteProfileForm>({
        username: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('oauth.complete-profile'));
    };

    return (
        <AuthLayout 
            title="Complete Your Profile" 
            description={`Welcome, ${oauth_user.name}! Choose a username to complete your ${oauth_user.provider_name} login.`}
        >
            <Head title="Complete Profile" />
            
            <div className="text-center mb-6">
                {oauth_user.avatar && (
                    <img 
                        src={oauth_user.avatar} 
                        alt={oauth_user.name} 
                        className="w-16 h-16 rounded-full mx-auto mb-2"
                    />
                )}
                <p className="text-sm text-gray-500">
                    Signed in with {oauth_user.provider_name.charAt(0).toUpperCase() + oauth_user.provider_name.slice(1)} as {oauth_user.email}
                </p>
            </div>
            
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-2">
                    <Label htmlFor="username">Choose a Username</Label>
                    <Input
                        id="username"
                        type="text"
                        required
                        autoFocus
                        tabIndex={1}
                        autoComplete="username"
                        value={data.username}
                        onChange={(e) => setData('username', e.target.value)}
                        disabled={processing}
                        placeholder="your_username"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        This will be your public identifier on Fanmora.
                    </p>
                    <InputError message={errors.username} className="mt-2" />
                </div>

                <Button 
                    type="submit" 
                    className="mt-4 w-full bg-gradient-to-r from-[#00AFF0] to-[#8D41D6] hover:opacity-90 transition text-white" 
                    tabIndex={2} 
                    disabled={processing}
                >
                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Complete Registration
                </Button>
            </form>
        </AuthLayout>
    );
}
