import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';
import { User } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { KeyIcon, UserIcon } from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';
import axios from 'axios';

interface Props {
    user: User;
}

export default function Profile({ user }: Props) {
    const [formStatus, setFormStatus] = useState({
        success: false,
        message: '',
        error: ''
    });

    const profileForm = useForm({
        name: user.name,
        email: user.email,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Reset success message after 3 seconds
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (formStatus.success) {
            timer = setTimeout(() => {
                setFormStatus(prev => ({...prev, success: false, message: ''}));
            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [formStatus.success]);

    const updateProfile: FormEventHandler = async (e) => {
        e.preventDefault();
        setFormStatus({success: false, message: '', error: ''});

        try {
            // Using axios directly for better control
            const response = await axios.post(route('admin.profile.update'), {
                _method: 'PUT',
                name: profileForm.data.name,
                email: profileForm.data.email
            });

            setFormStatus({
                success: true,
                message: 'Profile updated successfully!',
                error: ''
            });

            // Update the form data if different from response
            if (response.data && response.data.user) {
                profileForm.setData({
                    name: response.data.user.name,
                    email: response.data.user.email
                });
            }
        } catch (error: any) {
            console.error('Profile update error:', error);
            setFormStatus({
                success: false,
                message: '',
                error: error.response?.data?.message || 'Failed to update profile'
            });

            // Update errors in the form
            if (error.response?.data?.errors) {
                const serverErrors = error.response.data.errors;
                for (const key in serverErrors) {
                    profileForm.setError(key, serverErrors[key][0]);
                }
            }
        }
    };

    const updatePassword: FormEventHandler = async (e) => {
        e.preventDefault();

        try {
            await axios.post(route('admin.password.update'), {
                _method: 'PUT',
                ...passwordForm.data
            });

            setFormStatus({
                success: true,
                message: 'Password updated successfully!',
                error: ''
            });

            // Reset password form
            passwordForm.reset();
        } catch (error: any) {
            console.error('Password update error:', error);
            setFormStatus({
                success: false,
                message: '',
                error: error.response?.data?.message || 'Failed to update password'
            });

            // Update errors in the form
            if (error.response?.data?.errors) {
                const serverErrors = error.response.data.errors;
                for (const key in serverErrors) {
                    passwordForm.setError(key, serverErrors[key][0]);
                }
            }
        }
    };

    return (
        <AdminLayout title="My Profile" subtitle="Manage your account information">
            <Head title="Admin Profile" />

            <div className="py-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="bg-card rounded-xl p-4 shadow sm:p-8">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="bg-primary/10 rounded-full p-2">
                                <UserIcon className="text-primary h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-foreground text-lg font-medium">Profile Information</h2>
                                <p className="text-muted-foreground text-sm">Update your account details</p>
                            </div>
                        </div>

                        <form onSubmit={updateProfile} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    value={profileForm.data.name}
                                    onChange={(e) => profileForm.setData('name', e.target.value)}
                                    required
                                    autoComplete="name"
                                />
                                {profileForm.errors.name && (
                                    <div className="text-destructive mt-2 text-sm">{profileForm.errors.name}</div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    value={profileForm.data.email}
                                    onChange={(e) => profileForm.setData('email', e.target.value)}
                                    required
                                    autoComplete="username"
                                />
                                {profileForm.errors.email && (
                                    <div className="text-destructive mt-2 text-sm">{profileForm.errors.email}</div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <Button
                                    type="submit"
                                    disabled={profileForm.processing}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    Save Profile
                                </Button>

                                {formStatus.success && formStatus.message && (
                                    <p className="text-success text-sm">{formStatus.message}</p>
                                )}
                                {formStatus.error && (
                                    <p className="text-destructive text-sm">{formStatus.error}</p>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="bg-card rounded-xl p-4 shadow sm:p-8">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="bg-primary/10 rounded-full p-2">
                                <KeyIcon className="text-primary h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-foreground text-lg font-medium">Update Password</h2>
                                <p className="text-muted-foreground text-sm">Ensure your account is secure</p>
                            </div>
                        </div>

                        <form onSubmit={updatePassword} className="space-y-4">
                            <div>
                                <Label htmlFor="current_password">Current Password</Label>
                                <Input
                                    id="current_password"
                                    type="password"
                                    className="mt-1 block w-full"
                                    value={passwordForm.data.current_password}
                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                                {passwordForm.errors.current_password && (
                                    <div className="text-destructive mt-2 text-sm">{passwordForm.errors.current_password}</div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    className="mt-1 block w-full"
                                    value={passwordForm.data.password}
                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                    required
                                    autoComplete="new-password"
                                />
                                {passwordForm.errors.password && (
                                    <div className="text-destructive mt-2 text-sm">{passwordForm.errors.password}</div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    className="mt-1 block w-full"
                                    value={passwordForm.data.password_confirmation}
                                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                    required
                                    autoComplete="new-password"
                                />
                                {passwordForm.errors.password_confirmation && (
                                    <div className="text-destructive mt-2 text-sm">{passwordForm.errors.password_confirmation}</div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <Button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    Update Password
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
