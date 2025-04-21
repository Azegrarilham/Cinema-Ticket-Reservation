import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Cinema Experience" description="Welcome back! Sign in to your account.">
            <Head title="Log in" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <label htmlFor="email" className="text-sm font-medium text-foreground">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full px-4 py-2 transition border rounded-md bg-input border-input text-foreground placeholder-muted-foreground focus:ring-primary focus:border-transparent focus:ring-2 focus:outline-none"
                            placeholder="email@example.com"
                            required
                            autoFocus
                            tabIndex={1}
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="text-sm font-medium text-foreground">
                                Password
                            </label>
                            {canResetPassword && (
                                <TextLink
                                    href={route('password.request')}
                                    className="text-sm transition text-primary hover:text-primary/80"
                                    tabIndex={5}
                                >
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full px-4 py-2 transition border rounded-md bg-input border-input text-foreground placeholder-muted-foreground focus:ring-primary focus:border-transparent focus:ring-2 focus:outline-none"
                            placeholder="••••••••"
                            required
                            tabIndex={2}
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <input
                            id="remember"
                            type="checkbox"
                            className="w-4 h-4 bg-transparent rounded text-primary border-input focus:ring-primary"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            tabIndex={3}
                        />
                        <label htmlFor="remember" className="text-sm font-medium text-foreground">
                            Remember me
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-primary mt-4 flex w-full items-center justify-center rounded-md px-4 py-2.5 font-medium transition focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-75"
                        tabIndex={4}
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />}
                        Sign in
                    </button>
                </div>

                <div className="text-sm text-center text-muted-foreground">
                    Don't have an account?{' '}
                    <TextLink href={route('register')} className="transition text-primary hover:text-primary/80" tabIndex={5}>
                        Sign up
                    </TextLink>
                </div>
            </form>

            {status && (
                <div className="p-3 mt-4 text-sm font-medium text-center border rounded-md bg-success/10 border-success/30 text-success">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
