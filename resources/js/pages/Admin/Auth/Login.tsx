import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Lock, ShieldCheck } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

interface Props {
    canResetPassword: boolean;
    status?: string;
}

export default function Login({ canResetPassword, status }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.login'));
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
            <Head title="Admin Login" />

            <div className="relative w-full max-w-md px-8 py-8 overflow-hidden border shadow-xl bg-card border-border rounded-xl">
                {/* Admin badge */}
                <div className="absolute top-[10px] right-[-2px] w-30">
                    <div className="px-4 py-1 text-xs font-bold text-center transform rotate-45 translate-x-6 translate-y-3 shadow-md bg-primary text-primary-foreground">
                        ADMIN
                    </div>
                </div>

                <div className="flex justify-center mb-8">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center justify-center w-20 h-20 mb-1 bg-primary/10 rounded-xl">
                            <img className="w-16 h-16" src="/logo.png" alt="Admin Logo" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">Cinema Admin</h1>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Administrative Access</span>
                        </div>
                    </div>
                </div>

                {status && (
                    <div className="p-3 mb-6 text-sm font-medium border rounded-md bg-success/10 border-success/30 text-success">{status}</div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-foreground">
                            Admin Email
                        </label>
                        <div className="relative">
                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full py-2 pl-10 pr-4 transition border rounded-md bg-input border-input text-foreground placeholder-muted-foreground focus:ring-primary focus:border-transparent focus:ring-2 focus:outline-none"
                                placeholder="admin@example.com"
                                autoComplete="username"
                                required
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5 text-muted-foreground"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                            </div>
                        </div>
                        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium text-foreground">
                                Password
                            </label>
                            {canResetPassword && (
                                <a href={route('password.request')} className="text-sm transition text-primary hover:text-primary/80">
                                    Forgot password?
                                </a>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full py-2 pl-10 pr-4 transition border rounded-md bg-input border-input text-foreground placeholder-muted-foreground focus:ring-primary focus:border-transparent focus:ring-2 focus:outline-none"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Lock className="w-5 h-5 text-muted-foreground" />
                            </div>
                        </div>
                        {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password}</p>}
                    </div>

                    <div className="flex items-center">
                        <input
                            id="remember"
                            type="checkbox"
                            className="w-4 h-4 bg-transparent rounded text-primary border-input focus:ring-primary"
                            checked={data.remember}
                            onChange={(e) => {
                                // @ts-expect-error - Inertia form has typing issues with boolean values
                                setData('remember', e.target.checked);
                            }}
                        />
                        <label htmlFor="remember" className="block ml-2 text-sm text-foreground">
                            Keep me signed in
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="flex items-center justify-center w-full px-4 py-3 font-medium transition rounded-md bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-75"
                    >
                        {processing ? <LoaderCircle className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
                        Access Admin Panel
                    </button>
                </form>

                <div className="mt-8 text-xs text-center text-muted-foreground">
                    <p>Secure administrative area. Authorized personnel only.</p>
                </div>
            </div>
        </div>
    );
}
