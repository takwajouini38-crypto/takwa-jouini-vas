import React from 'react';
import { Head } from '@inertiajs/react';

export default function GuestLayout({ children, title = "Connexion" }) {
    return (
        <>
            <Head title={title} />

            <div className="min-h-screen flex items-center justify-center bg-blue-600">
                {/* Conteneur central */}
                <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
                    {children}
                </div>
            </div>
        </>
    );
}
