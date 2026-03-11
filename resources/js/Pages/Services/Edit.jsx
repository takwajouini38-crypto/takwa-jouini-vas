import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Form from './Form';

export default function Edit({ service }) {
    return (
        <AuthenticatedLayout>
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-semibold mb-4">Modifier le service</h1>
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <Form service={service} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}