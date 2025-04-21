import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { LoaderCircle, Heart, Users, MessageCircle } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Logo from '@/components/ui/Logo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

const WelcomeHero: React.FC = () => {
    const { data, setData, post, processing, errors } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <section className="min-h-[calc(100vh-64px)] w-full relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/20">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#00AFF0]/5 -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#0080C0]/5 translate-y-1/2 -translate-x-1/3"></div>

            <div className="container mx-auto px-6 py-12 flex flex-col lg:flex-row gap-16 min-h-[calc(100vh-64px)] relative z-10">
                {/* Left side: Branding and message */}
                <div className="w-full lg:w-3/5 flex flex-col justify-center">
                    <div className="max-w-2xl mx-auto lg:mx-0">
                        <Logo variant="default" className="h-10 w-auto mb-8" />

                        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
                            Share your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00AFF0] to-[#0080C0]">passions</span> with the world
                        </h1>

                        <p className="text-lg mb-8 text-gray-700 dark:text-gray-300 max-w-xl">
                            Connect, create, and explore. Join a vibrant community where your interests come to life.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <Link
                                href={route('register')}
                                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#00AFF0] hover:bg-[#0080C0] transition"
                            >
                                Sign up for Fanmora
                            </Link>
                            <Link
                                href="#features"
                                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-700 text-base font-medium rounded-md text-gray-700 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            >
                                Learn more
                            </Link>
                        </div>

                        {/* Feature highlights */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#00AFF0]/10 text-[#00AFF0]">
                                    <Heart size={20} />
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">Share your content</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#0080C0]/10 text-[#0080C0]">
                                    <Users size={20} />
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">Build your community</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#00AFF0]/10 text-[#00AFF0]">
                                    <MessageCircle size={20} />
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">Connect with fans</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side: Login form */}
                <div className="w-full lg:w-2/5 flex flex-col justify-center">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md mx-auto w-full border border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                            Log in to your account
                        </h2>

                        <form onSubmit={submit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    tabIndex={1}
                                    placeholder="email@example.com"
                                    className="w-full"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm text-primary hover:underline"
                                        tabIndex={4}
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    tabIndex={2}
                                    className="w-full"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center mt-4 text-sm space-x-2 mx-auto w-fit">
                                <Link
                                    href={route('password.request')}
                                    className="text-[#00AFF0] hover:text-[#0080C0] font-medium transition-colors"
                                    tabIndex={4}
                                >
                                    Forgot password?
                                </Link>
                                <span className="text-gray-500 dark:text-gray-400">|</span>
                                <Link
                                    href={route('register')}
                                    className="text-[#00AFF0] hover:text-[#0080C0] font-medium transition-colors"
                                    tabIndex={5}
                                >
                                    Sign up for Fanmora
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[#00AFF0] hover:bg-[#0080C0] text-white"
                                tabIndex={3}
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Log in
                            </Button>
                        </form>

                        <div className="mt-5">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 space-y-2">
                                <a
                                    href={route('oauth.redirect', { provider: 'google' })}
                                    className="flex items-center justify-center w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-700 dark:text-white transition font-medium"
                                >
                                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                                        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                                            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                                            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                                            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                                        </g>
                                    </svg>
                                    Sign in with Google
                                </a>

                                <a
                                    href={route('oauth.redirect', { provider: 'twitter' })}
                                    className="flex items-center justify-center w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-white transition font-medium"
                                >
                                    <svg className="h-5 w-5 mr-2 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22.162 5.656a8.384 8.384 0 0 1-2.402.658A4.196 4.196 0 0 0 21.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 0 0-7.126 3.814 11.874 11.874 0 0 1-8.62-4.37 4.168 4.168 0 0 0-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 0 1-1.894-.523v.052a4.185 4.185 0 0 0 3.355 4.101 4.21 4.21 0 0 1-1.89.072A4.185 4.185 0 0 0 7.97 16.65a8.394 8.394 0 0 1-6.191 1.732 11.83 11.83 0 0 0 6.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.496 8.496 0 0 0 2.087-2.165z" />
                                    </svg>
                                    Sign in with X
                                </a>
                            </div>

                        </div>
                    </div>
                </div>
            </div >
        </section >
    );
};;

export default WelcomeHero;
