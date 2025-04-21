import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';
import { User } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { PlusCircleIcon, UserPlusIcon, UsersIcon, WrenchIcon } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface Props {
    user: User;
    admins?: User[];
}

export default function Settings({ user, admins = [] }: Props) {
    const [showNewAdminForm, setShowNewAdminForm] = useState(false);

    const newAdminForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const createAdmin: FormEventHandler = (e) => {
        e.preventDefault();
        newAdminForm.post(route('admin.users.store'), {
            preserveScroll: true,
            onSuccess: () => {
                newAdminForm.reset();
                setShowNewAdminForm(false);
            },
        });
    };

    return (
        <AdminLayout title="Admin Settings" subtitle="Manage system settings and administrators">
            <Head title="Admin Settings" />

            <div className="py-6">
                <div className="space-y-6">
                    <div className="bg-card rounded-xl p-4 shadow sm:p-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 rounded-full p-2">
                                    <UsersIcon className="text-primary h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-foreground text-lg font-medium">Admin Users</h2>
                                    <p className="text-muted-foreground text-sm">Manage administrator accounts</p>
                                </div>
                            </div>
                            <Button
                                onClick={() => setShowNewAdminForm(!showNewAdminForm)}
                                variant={showNewAdminForm ? 'outline' : 'default'}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary flex items-center gap-2 rounded-md px-4 py-2 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                                aria-expanded={showNewAdminForm}
                                aria-controls="new-admin-form"
                            >
                                {showNewAdminForm ? (
                                    <>Cancel</>
                                ) : (
                                    <>
                                        <UserPlusIcon className="h-4 w-4" aria-hidden="true" />
                                        <span>Add Admin</span>
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Current Admins List */}
                        <div className="border-border mt-6 overflow-hidden rounded-lg border">
                            <table className="divide-border min-w-full divide-y">
                                <thead className="bg-muted">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
                                        >
                                            Name
                                        </th>
                                        <th
                                            scope="col"
                                            className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
                                        >
                                            Email
                                        </th>
                                        <th
                                            scope="col"
                                            className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
                                        >
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-border divide-y">
                                    {/* Current admin (you) */}
                                    <tr>
                                        <td className="text-foreground px-6 py-4 text-sm font-medium whitespace-nowrap">
                                            {user.name} <span className="text-primary ml-2 text-xs">(You)</span>
                                        </td>
                                        <td className="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="bg-success/10 text-success inline-flex rounded-full px-2 text-xs leading-5 font-semibold">
                                                Active
                                            </span>
                                        </td>
                                    </tr>

                                    {/* Other admins */}
                                    {admins
                                        .filter((admin) => admin.id !== user.id)
                                        .map((admin) => (
                                            <tr key={admin.id}>
                                                <td className="text-foreground px-6 py-4 text-sm font-medium whitespace-nowrap">{admin.name}</td>
                                                <td className="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap">{admin.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="bg-success/10 text-success inline-flex rounded-full px-2 text-xs leading-5 font-semibold">
                                                        Active
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        {/* New Admin Form */}
                        {showNewAdminForm && (
                            <div id="new-admin-form" className="bg-muted/50 border-border mt-6 rounded-lg border p-4">
                                <h3 className="text-foreground flex items-center font-medium">
                                    <PlusCircleIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Add New Administrator
                                </h3>

                                <form onSubmit={createAdmin} className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="admin-name">Name</Label>
                                        <Input
                                            id="admin-name"
                                            value={newAdminForm.data.name}
                                            onChange={(e) => newAdminForm.setData('name', e.target.value)}
                                            required
                                            placeholder="Admin Name"
                                        />
                                        {newAdminForm.errors.name && (
                                            <div className="text-destructive mt-1 text-sm" role="alert">
                                                {newAdminForm.errors.name}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="admin-email">Email</Label>
                                        <Input
                                            id="admin-email"
                                            type="email"
                                            value={newAdminForm.data.email}
                                            onChange={(e) => newAdminForm.setData('email', e.target.value)}
                                            required
                                            placeholder="admin@example.com"
                                        />
                                        {newAdminForm.errors.email && (
                                            <div className="text-destructive mt-1 text-sm" role="alert">
                                                {newAdminForm.errors.email}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="admin-password">Password</Label>
                                        <Input
                                            id="admin-password"
                                            type="password"
                                            value={newAdminForm.data.password}
                                            onChange={(e) => newAdminForm.setData('password', e.target.value)}
                                            required
                                            placeholder="••••••••"
                                        />
                                        {newAdminForm.errors.password && (
                                            <div className="text-destructive mt-1 text-sm" role="alert">
                                                {newAdminForm.errors.password}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="admin-password-confirmation">Confirm Password</Label>
                                        <Input
                                            id="admin-password-confirmation"
                                            type="password"
                                            value={newAdminForm.data.password_confirmation}
                                            onChange={(e) => newAdminForm.setData('password_confirmation', e.target.value)}
                                            required
                                            placeholder="••••••••"
                                        />
                                        {newAdminForm.errors.password_confirmation && (
                                            <div className="text-destructive mt-1 text-sm" role="alert">
                                                {newAdminForm.errors.password_confirmation}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-4 sm:col-span-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowNewAdminForm(false)}
                                            className="focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={newAdminForm.processing}
                                            className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none"
                                        >
                                            Add Administrator
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                    <div className="bg-card rounded-xl p-4 shadow sm:p-8">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="bg-primary/10 rounded-full p-2">
                                <WrenchIcon className="text-primary h-5 w-5" aria-hidden="true" />
                            </div>
                            <div>
                                <h2 className="text-foreground text-lg font-medium">System Settings</h2>
                                <p className="text-muted-foreground text-sm">Configure global application settings</p>
                            </div>
                        </div>

                        <div className="text-muted-foreground border-border rounded-md border p-4 text-sm">
                            Additional settings options will be available in future updates.
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
