import { useForm, usePage } from '@inertiajs/react';

export default function ProfilePhoto() {
    const user = usePage().props.auth.user; // Récupère l'utilisateur connecté
    const { data, setData, post, processing, errors } = useForm({
        photo: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.photo.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <section className="max-w-xl">
            <header>
                <h2 className="text-lg font-medium text-gray-900">Photo de profil</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Mettez à jour votre avatar pour personnaliser votre compte.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="flex items-center gap-4">
                    <img 
                        src={user.photo ? `/storage/${user.photo}` : '/images/default-avatar.png'} 
                        className="w-20 h-20 rounded-full object-cover border"
                        alt="Avatar" 
                    />
                    
                    <input 
                        type="file" 
                        onChange={e => setData('photo', e.target.files[0])}
                        className="text-sm text-gray-500"
                    />
                </div>

                {errors.photo && <p className="text-red-600 text-sm">{errors.photo}</p>}

                <div className="flex items-center gap-4">
                    <button 
                        type="submit" 
                        disabled={processing}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {processing ? 'Enregistrement...' : 'Sauvegarder la photo'}
                    </button>
                </div>
            </form>
        </section>
    );
}