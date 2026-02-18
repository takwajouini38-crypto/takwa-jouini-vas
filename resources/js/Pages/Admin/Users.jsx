import React, { useState, useMemo } from 'react';
import { usePage, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Users() {
    const pageProps = usePage()?.props || {};
    const users = Array.isArray(pageProps.users) ? pageProps.users : [];
    const authUser = pageProps.auth?.user || null;

    const [deletingUserId, setDeletingUserId] = useState(null);
    const [search, setSearch] = useState('');

    const handleDelete = (userId) => {
        if (!userId) return;
        if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
            setDeletingUserId(userId);
            router.delete(route('users.destroy', userId), {
                onFinish: () => setDeletingUserId(null),
            });
        }
    };

    // Filtrage + recherche
    const filteredUsers = useMemo(() => {
        return users
            .filter(u => u?.role && u.role !== 'admin')
            .filter(u =>
                u?.name?.toLowerCase().includes(search.toLowerCase()) ||
                u?.email?.toLowerCase().includes(search.toLowerCase()) ||
                u?.role?.toLowerCase().includes(search.toLowerCase())
            );
    }, [users, search]);

    return (
        <AuthenticatedLayout title="Gestion des utilisateurs">
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Liste des utilisateurs</h2>

                {/* Recherche */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email ou rôle..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-1/2 p-2 border rounded shadow-sm"
                    />
                </div>

                {/* Tableau */}
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-2 px-4 border-b">ID</th>
                                <th className="py-2 px-4 border-b">Nom</th>
                                <th className="py-2 px-4 border-b">Email</th>
                                <th className="py-2 px-4 border-b">Rôle</th>
                                <th className="py-2 px-4 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(u => (
                                    <tr key={u.id} className="text-center">
                                        <td className="py-2 px-4 border-b">{u.id}</td>
                                        <td className="py-2 px-4 border-b">{u.name}</td>
                                        <td className="py-2 px-4 border-b">{u.email}</td>
                                        <td className="py-2 px-4 border-b">{u.role}</td>
                                        <td className="py-2 px-4 border-b">
                                            <PrimaryButton
                                                onClick={() => handleDelete(u.id)}
                                                disabled={deletingUserId === u.id}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                {deletingUserId === u.id ? 'Suppression...' : 'Supprimer'}
                                            </PrimaryButton>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-4 text-center">
                                        Aucun utilisateur trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
