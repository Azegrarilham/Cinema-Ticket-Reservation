// Components
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

interface PageProps {
    auth: {
        user: {
            role?: string;
        } | null;
    };
    [key: string]: any;
}

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});
    const { auth } = usePage<PageProps>().props;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <AuthLayout title="Verify email" description="Please verify your email address by clicking on the link we just emailed to you.">
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-sm font-medium text-center text-green-600">
                    A new verification link has been sent to the email address you provided during registration.
                </div>
            )}

            <form onSubmit={submit} className="space-y-6 text-center">
                <Button disabled={processing} className="mx-auto">
                    Resend verification email
                </Button>

                <TextLink
                    href={auth?.user?.role === 'admin' ? route('admin.logout') : route('logout')}
                    method="post"
                    className="block mx-auto text-sm"
                >
                    Log out
                </TextLink>
            </form>
        </AuthLayout>
    );
}
