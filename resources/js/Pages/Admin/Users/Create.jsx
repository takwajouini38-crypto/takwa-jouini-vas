import React from "react";
import { Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        password: "",
        role: "",
    });

    const submit = (e) => {
        e.preventDefault();
        // On utilise l'URL directe car vous avez mentionné ne pas utiliser Ziggy parfois
        post("/admin/users", {
            preserveScroll: true,
            onError: (err) => console.log("Erreurs reçues :", err),
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-800">Créer un utilisateur</h2>}
        >
            <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="mb-4">
                    <Link href="/admin/users" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
                        <ArrowLeftIcon className="h-4 w-4 mr-1" />
                        Retour à la liste
                    </Link>
                </div>

                <div className="bg-white shadow-sm sm:rounded-lg">
                    <div className="p-6 border-b border-gray-200">
                        <form onSubmit={submit} className="space-y-6">
                            {/* NOM */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nom</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    className={`mt-1 block w-full rounded-md shadow-sm ${
                                        errors.name ? "border-red-500 ring-red-500" : "border-gray-300"
                                    }`}
                                />
                                {errors.name && <div className="text-red-600 text-xs mt-1">{errors.name}</div>}
                            </div>

                            {/* EMAIL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="text" 
                                    value={data.email}
                                    onChange={(e) => setData("email", e.target.value)}
                                    className={`mt-1 block w-full rounded-md shadow-sm ${
                                        errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    }`}
                                />
                                {/* L'ERREUR D'EMAIL EXISTANT S'AFFICHE ICI */}
                                {errors.email && (
                                    <div className="text-red-600 text-sm mt-1 font-medium italic">
                                        ⚠️ {errors.email}
                                    </div>
                                )}
                            </div>

                            {/* PASSWORD */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData("password", e.target.value)}
                                    className={`mt-1 block w-full rounded-md shadow-sm ${
                                        errors.password ? "border-red-500" : "border-gray-300"
                                    }`}
                                />
                                {errors.password && <div className="text-red-600 text-xs mt-1">{errors.password}</div>}
                            </div>

                            {/* ROLE */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Rôle</label>
                                <select
                                    value={data.role}
                                    onChange={(e) => setData("role", e.target.value)}
                                    className={`mt-1 block w-full rounded-md shadow-sm ${
                                        errors.role ? "border-red-500" : "border-gray-300"
                                    }`}
                                >
                                    <option value="">Sélectionner un rôle</option>
                                    <option value="admin">Administrateur</option>
                                    <option value="technicien">Technicien</option>
                                    <option value="analyst_op">Analyste Op</option>
                                    <option value="analyst_biz">Analyste Biz</option>
                                </select>
                                {errors.role && <div className="text-red-600 text-xs mt-1">{errors.role}</div>}
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? "Enregistrement..." : "Enregistrer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}