import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react'; // ✅ router remplace Inertia
import PrimaryButton from '@/Components/PrimaryButton';

export default function Users() {
    const { users } = usePage().props; // Les utilisateurs envoyés par Laravel
    const [deletingUserId, setDeletingUserId] = useState(null);

    const handleDelete = (userId) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
            setDeletingUserId(userId);
            router.delete(route('users.destroy', userId), {
                onFinish: () => setDeletingUserId(null),
            });
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Liste des utilisateurs</h2>

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
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user.id} className="text-center">
                                    <td className="py-2 px-4 border-b">{user.id}</td>
                                    <td className="py-2 px-4 border-b">{user.name}</td>
                                    <td className="py-2 px-4 border-b">{user.email}</td>
                                    <td className="py-2 px-4 border-b">{user.role}</td>
                                    <td className="py-2 px-4 border-b">
                                        <PrimaryButton
                                            onClick={() => handleDelete(user.id)}
                                            disabled={deletingUserId === user.id}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            {deletingUserId === user.id ? 'Suppression...' : 'Supprimer'}
                                        </PrimaryButton>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-4">
                                    Aucun utilisateur trouvé.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
