<?php

namespace App\Http\Controllers;

use App\Models\ServiceSmsPlus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceSmsPlusController extends Controller
{
    // Liste des services
    public function index()
    {
        $services = ServiceSmsPlus::orderBy('created_at', 'asc')->paginate(10);
        return Inertia::render('Services/Index', [
            'services' => $services,
            'flash' => session('flash') // Pour afficher les messages de succès
        ]);
    }

    // Formulaire création
    public function create()
    {
        return Inertia::render('Services/Create');
    }

    // Stocker un service
   public function store(Request $request)
{
    // Convertir la virgule en point pour le prix
    if ($request->has('prix')) {
        $prix = str_replace(',', '.', $request->prix);
        $request->merge(['prix' => $prix]);
    }

    $validated = $request->validate([
        'service_name' => 'required|string|max:255',
        'short_code' => 'required|digits_between:4,7',
        'keyword' => 'nullable|string|max:255',
        'type' => 'required|string|max:255',
        'price' => ['required','numeric','min:0','max:10','regex:/^\d+(\.\d{1,2})?$/']
    ], [
        'short_code.required' => 'Le numéro court est obligatoire.',
        'short_code.digits_between' => 'Le numéro court doit contenir entre 4 et 7 chiffres.',
        'price.min' => 'Le prix doit être positif.',
        'price.max' => 'Le prix ne doit pas dépasser 10.',
        'price.regex' => 'Le prix doit contenir au maximum 2 décimales.'
    ]);

    // Si keyword est vide ou null, on le définit à "_N"
    if (empty($validated['short_code'])) {
        $validated['short_code'] = '_N';
    }

    ServiceSmsPlus::create($validated);

    return redirect()->route('services.index')
        ->with('flash', ['success' => 'Service créé avec succès.']);
}

    // Formulaire édition
    public function edit(ServiceSmsPlus $service)
    {
        return Inertia::render('Services/Edit', [
            'service' => $service
        ]);
    }

    // Mettre à jour un service
    public function update(Request $request, ServiceSmsPlus $service)
{
    // Convertir la virgule en point pour le prix
    if ($request->has('prix')) {
        $prix = str_replace(',', '.', $request->prix);
        $request->merge(['prix' => $prix]);
    }

    $validated = $request->validate([
        'service_name' => 'required|string|max:255',
        'short_code' => 'required|digits_between:4,7',
        'keyword' => 'nullable|string|max:255',
        'type' => 'required|string|max:255',
        'price' => ['required','numeric','min:0','max:10','regex:/^\d+(\.\d{1,2})?$/']
    ], [
        'short_code.required' => 'Le numéro court est obligatoire.',
        'short_code.digits_between' => 'Le numéro court doit contenir entre 4 et 7 chiffres.',
        'price.min' => 'Le prix doit être positif.',
        'price.max' => 'Le prix ne doit pas dépasser 10.',
        'price.regex' => 'Le prix doit contenir au maximum 2 décimales.'
    ]);

    // Si keyword est vide ou null, on le définit à "_N"
    if (empty($validated['keyword'])) {
        $validated['keyword'] = '_N';
    }

    $service->update($validated);

    return redirect()->route('services.index')
        ->with('flash', ['success' => 'Service modifié avec succès.']);
}

    // Supprimer un service
    public function destroy(ServiceSmsPlus $service)
    {
        $service->delete();

        return redirect()->route('services.index')
            ->with('flash', ['success' => 'Service supprimé avec succès.']);
    }
}