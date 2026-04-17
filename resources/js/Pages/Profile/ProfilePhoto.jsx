import { router } from '@inertiajs/react';
import {  router ,useForm } from '@inertiajs/react';

export default function ProfilePhoto({ user }) {
    const { data, setData, post, processing, errors } = useForm({
        photo: null,
    });


function submit(e) {
    e.preventDefault();
    
    // On envoie en POST à ta route de profil
    router.post('/profile/photo', {
        _method: 'post', // Optionnel ici car la route est déjà en POST
        photo: data.photo,
        forceFormData: true,
    });
}
    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                {/* Affichage de la photo actuelle ou d'une image par défaut */}
                <img 
                    src={user.photo ? `/storage/${user.photo}` : '/images/default-avatar.png'} 
                    className="w-20 h-20 rounded-full object-cover"
                    alt="Profil" 
                />
            </div>

            <input 
                type="file" 
                onChange={e => setData('photo', e.target.files[0])}
                className="block w-full text-sm text-gray-500"
            />
            
            {errors.photo && <div className="text-red-500 text-xs">{errors.photo}</div>}

            <button 
                type="submit" 
                disabled={processing}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                {processing ? 'Chargement...' : 'Changer la photo'}
            </button>
        </form>
    );
}