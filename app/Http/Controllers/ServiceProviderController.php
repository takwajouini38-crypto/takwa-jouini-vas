<?php

namespace App\Http\Controllers;

use App\Models\ServiceProvider; 
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceProviderController extends Controller
{
    public function index()
    {
        // On récupère les fournisseurs (providers)
        $provider = ServiceProvider::orderBy('created_at', 'asc')->paginate(10);
        
        // Rendu vers resources/js/Pages/Providers/Index.jsx
        return Inertia::render('Providers/Index', [
            'fournisseurs' => $provider, // On garde 'fournisseurs' si c'est ce que votre Index.jsx attend
            'flash' => session('flash')
        ]);
    }

    public function create()
    {
        // Rendu vers resources/js/Pages/Providers/Create.jsx
        return Inertia::render('Providers/Create');
    }

    public function store(Request $request)
{
    $validated = $request->validate([
        // Changement ici : 'service_providers' au lieu de 'service_provider'
        'provider_name' => 'required|string|max:255|unique:service_providers,provider_name',
        'nationnalite'  => 'required|string|max:100',
        // Exemple : 8 chiffres suivis d'une lettre (ex: 12345678A)
        'id_fiscale'    => [
            'required',
            'string',
            'unique:service_providers,id_fiscale',
            'regex:/^[0-9]{8}[A-Z]$/' 
        ],
        'adresse'       => 'nullable|string|max:500',
    ], [
        'provider_name.required' => 'Le nom du partenaire est obligatoire.',
        'provider_name.unique'   => 'Ce nom de partenaire existe déjà.',
        'nationnalite.required'  => 'Veuillez choisir une nationalité.',
        // Messages personnalisés en français
        'id_fiscale.regex' => "Le format de l'ID fiscal est invalide (ex: 12345678A).",
        'id_fiscale.unique' => "Cet ID fiscal est déjà utilisé.",
    ]);

    ServiceProvider::create($validated);

    return redirect()->route('providers.index')
        ->with('flash', ['success' => 'Fournisseur ajouté avec succès.']);
}
    public function edit($id)
    {
        $provider = ServiceProvider::findOrFail($id);

        // Rendu vers resources/js/Pages/Providers/Edit.jsx
        return Inertia::render('Providers/Edit', [
            'fournisseur' => $provider
        ]);
    }

    public function update(Request $request, $id)
    {
        $provider = ServiceProvider::findOrFail($id);

        $validated = $request->validate([
            'provider_name' => 'required|string|max:255|unique:service_providers,provider_name,'.$provider->id,
            'nationnalite'  => 'required|string|max:100',
            'id_fiscale'    => 'nullable|string|max:100',
            'adresse'       => 'nullable|string|max:500',
        ]);

        $provider->update($validated);

        return redirect()->route('providers.index')
            ->with('flash', ['success' => 'Fournisseur mis à jour avec succès.']);
    }

   public function destroy(ServiceProvider $provider) // Laravel fait le findOrFail($id) tout seul
{
    $provider->delete();

    return redirect()->route('providers.index')
        ->with('flash', ['success' => 'Fournisseur supprimé avec succès.']);
}
public function checkIdFiscale(Request $request)
    {
        // On récupère la valeur envoyée par Axios
        $value = $request->query('id_fiscale');

        if (!$value) {
            return response()->json(['exists' => false]);
        }

        // Vérification dans la base de données
        $exists = ServiceProvider::where('id_fiscale', $value)->exists();

        return response()->json([
            'exists' => $exists
        ]);
    }


}