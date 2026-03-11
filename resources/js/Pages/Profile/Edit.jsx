import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Form from './Form';

export default function Edit({ auth, service }) {

    return (
        <AuthenticatedLayout user={auth.user}>

            <h1>Modifier service</h1>

            <Form service={service} />

        </AuthenticatedLayout>
    );
}