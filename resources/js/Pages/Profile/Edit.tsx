import AdminPageHeader from '@/Components/AdminPageHeader';
import FlashMessage from '@/Components/FlashMessage';
import AdminLayout from '@/Layouts/AdminLayout';
import CashierLayout from '@/Layouts/CashierLayout';
import { PageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const { auth, flash } = usePage<any>().props;
    const userRole = auth?.user?.role;

    const Layout = userRole === 'admin' ? AdminLayout : CashierLayout;

    return (
        <Layout>
            <Head title="My Profile" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-content space-y-6">
                    <AdminPageHeader
                        eyebrow="Account Settings"
                        title="My Profile"
                        description="Manage your account information and security settings."
                    />

                    <FlashMessage
                        success={flash?.success}
                        error={flash?.error}
                    />

                    {/* items-stretch makes both cards the same height */}
                    <div className="grid items-stretch gap-6 lg:grid-cols-2">
                        {/* Profile Info Panel */}
                        <section className="panel flex flex-col p-5 sm:p-6">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                            />
                        </section>

                        {/* Update Password Panel */}
                        <section className="panel flex flex-col p-5 sm:p-6">
                            <UpdatePasswordForm />
                        </section>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
