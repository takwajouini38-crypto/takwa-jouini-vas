import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Dashboard() {
    return (
        <AuthenticatedLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
                <h1 className="text-2xl font-bold mb-4">Bienvenue sur le Dashboard Admin !</h1>
                <p>Sélectionnez un module dans la barre latérale pour commencer.</p>
            </div>
        </AuthenticatedLayout>
    );
}
