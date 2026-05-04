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
    // 1. Log des données entrantes pour vérifier ce que React envoie
    \Log::info('Données reçues de React :', $request->all());

    // 2. Nettoyage du prix (on utilise 'price' et non 'prix')
    if ($request->has('price')) {
        $price = str_replace(',', '.', $request->price);
        $request->merge(['price' => $price]);
    }

    try {
        // 3. Validation
        $validated = $request->validate([
            'service_name' => 'required|string|max:255',
            'short_code'   => 'required|digits_between:4,15', // Ajusté selon vos tests (216...)
            'keyword'      => 'required|string|max:255|unique:SERVICES_SMS_PLUS,KEYWORD',
            'type'         => 'required|string|max:255',
            'price'        => ['required', 'numeric', 'min:0', 'max:10', 'regex:/^\d+(\.\d{1,2})?$/']
        ], [
            'keyword.unique' => 'Ce mot-clé est déjà utilisé par un autre service.',
            'price.regex'    => 'Le prix doit contenir au maximum 2 décimales.',
        ]);

        // 4. Tentative d'insertion
        $service = ServiceSmsPlus::create($validated);
        
        \Log::info('Service créé avec succès ! ID Oracle :', ['id' => $service->id]);

        return redirect()->route('services.index')
            ->with('flash', ['success' => 'Service créé avec succès.']);

    } catch (\Illuminate\Validation\ValidationException $e) {
        // Log si la validation échoue (ex: mot-clé déjà pris)
        \Log::warning('Échec de validation :', $e->errors());
        throw $e; 

    } catch (\Exception $e) {
        // Log si Oracle crash (ex: Table inexistante ORA-00942)
        \Log::error('Erreur CRITIQUE Oracle :', [
            'message' => $e->getMessage(),
            'code' => $e->getCode()
        ]);
        
        return back()->withErrors(['keyword' => 'Erreur technique base de données : ' . $e->getMessage()]);
    }
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
    // 1. Correction du prix (comme dans le store)
    if ($request->has('price')) {
        $price = str_replace(',', '.', $request->price);
        $request->merge(['price' => $price]);
    }

    $validated = $request->validate([
        'service_name' => 'required|string|max:255',
        'short_code'   => 'required|digits_between:4,15',
        // On ajoute .$service->id pour dire à Oracle : "Vérifie l'unicité MAIS ignore mon propre ID"
        'keyword'      => 'required|string|max:255|unique:SERVICES_SMS_PLUS,KEYWORD,' . $service->id,
        'type'         => 'required|string|max:255',
        'price'        => ['required', 'numeric', 'min:0', 'max:10', 'regex:/^\d+(\.\d{1,2})?$/']
    ], [
        'keyword.unique' => 'Ce mot-clé est déjà utilisé par un autre service.',
    ]);

    $service->update($validated);

    return redirect()->route('services.index')
        ->with('flash', ['success' => 'Service mis à jour avec succès.']);
}

    // Supprimer un service
    public function destroy(ServiceSmsPlus $service)
    {
        $service->delete();

        return redirect()->route('services.index')
            ->with('flash', ['success' => 'Service supprimé avec succès.']);
    }
  public function checkKeyword(Request $request)
{
    try {
        // On récupère le mot-clé et l'ID (s'il existe)
        $keyword = $request->keyword;
        $currentId = $request->id; // C'est l'ID envoyé par Edit.jsx

        $query = \App\Models\ServiceSmsPlus::where('KEYWORD', $keyword);

        // Crucial : Si on est en mode modification, on ignore le service actuel
        if ($currentId) {
            // Remplacez 'SERVICE_ID' par le nom exact de votre clé primaire Oracle
            $query->where('id', '!=', $currentId);
        }

        $exists = $query->exists();

        return response()->json([
            'isUnique' => !$exists
        ]);
    } catch (\Exception $e) {
        // En cas d'erreur, on renvoie un message pour débugger
        return response()->json(['error' => $e->getMessage()], 500);
    }
}
}