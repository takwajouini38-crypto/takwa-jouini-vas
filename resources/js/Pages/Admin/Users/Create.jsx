import React, { useEffect, useState } from "react";
import { Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import axios from "axios";

export default function Create() {

    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        password: "",
        role: "",
    });

    const [emailStatus, setEmailStatus] = useState(null);
    const [passwordStatus, setPasswordStatus] = useState([]);

    // ---------------- EMAIL LIVE CHECK ----------------
    useEffect(() => {

        if (!data.email) {
            setEmailStatus(null);
            return;
        }

        const delay = setTimeout(() => {

            axios.get("/admin/users/check-email", {
                params: { email: data.email }
            })
            .then(res => {
                setEmailStatus(res.data.exists ? "taken" : "available");
            })
            .catch(() => setEmailStatus(null));

        }, 500);

        return () => clearTimeout(delay);

    }, [data.email]);

    // ---------------- PASSWORD VALIDATION ----------------
    useEffect(() => {

        const pwd = data.password;
        const list = [];

        if (!pwd) {
            setPasswordStatus([]);
            return;
        }

        if (pwd.length < 6) list.push("❌ Minimum 6 caractères");
        if (!/[A-Z]/.test(pwd)) list.push("❌ Une majuscule requise");
        if (!/[0-9]/.test(pwd)) list.push("❌ Un chiffre requis");
        if (!/[!@#$%^&*]/.test(pwd)) list.push("❌ Un caractère spécial requis");

        if (list.length === 0) list.push("✅ Mot de passe valide");

        setPasswordStatus(list);

    }, [data.password]);

    function submit(e) {
        e.preventDefault();

        post("/admin/users");
    }

    const isPasswordValid =
        passwordStatus.length === 1 &&
        passwordStatus[0].startsWith("✅");

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Créer un utilisateur
                </h2>
            }
        >
            <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">

                {/* BACK BUTTON */}
                <div className="mb-4">
                    <Link
                        href="/admin/users"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-1" />
                        Retour à la liste
                    </Link>
                </div>

                {/* CARD */}
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 bg-white border-b border-gray-200">

                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Ajouter un utilisateur
                        </h2>

                        <form onSubmit={submit} className="space-y-6">

                            {/* NAME */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="Nom complet"
                                />
                                {errors.name && (
                                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* EMAIL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData("email", e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="email@exemple.com"
                                />

                                {emailStatus === "taken" && (
                                    <p className="mt-2 text-sm text-red-600">
                                        ❌ Email déjà utilisé
                                    </p>
                                )}

                                {emailStatus === "available" && (
                                    <p className="mt-2 text-sm text-green-600">
                                        ✅ Email disponible
                                    </p>
                                )}

                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* PASSWORD */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Mot de passe
                                </label>

                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData("password", e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="••••••••"
                                />

                                <div className="mt-2 space-y-1">
                                    {passwordStatus.map((msg, i) => (
                                        <p
                                            key={i}
                                            className={
                                                msg.startsWith("✅")
                                                    ? "text-green-600 text-sm"
                                                    : "text-red-600 text-sm"
                                            }
                                        >
                                            {msg}
                                        </p>
                                    ))}
                                </div>

                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            {/* ROLE */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Rôle
                                </label>

                                <select
                                    value={data.role}
                                    onChange={(e) => setData("role", e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="">Choisir un rôle</option>
                                    <option value="admin">Admin</option>
                                    <option value="technicien">Technicien</option>
                                    <option value="analyst_op">Analyst Op</option>
                                    <option value="analyst_biz">Analyst Biz</option>
                                </select>

                                {errors.role && (
                                    <p className="mt-2 text-sm text-red-600">{errors.role}</p>
                                )}
                            </div>

                            {/* BUTTON */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing || emailStatus === "taken" || !isPasswordValid}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring ring-blue-300 disabled:opacity-25 transition"
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