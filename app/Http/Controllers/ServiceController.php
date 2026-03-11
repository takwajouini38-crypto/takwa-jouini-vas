<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceController extends Controller
{

    public function index()
    {
        $services = Service::orderBy('ID','asc')->paginate(10);

        return Inertia::render('Services/Index',[
            'services'=>$services
        ]);
    }


    public function create()
    {
        return Inertia::render('Services/Create');
    }


   public function store(Request $request)
{
    $validated = $request->validate([
        'nom_service'    => 'required|string|max:100',
        'nom_fournisseur'=> 'required|string|max:100',
        'numero_court'   => 'nullable|string|max:20',
        'keyword'        => 'nullable|string|max:50',
        'type'           => 'nullable|string|max:50',
        'prix'           => 'nullable|numeric'
    ]);

    Service::create([
        'NOM_SERVICE'    => $validated['nom_service'],
        'NOM_FOURNISSEUR'=> $validated['nom_fournisseur'],
        'NUMERO_COURT'   => $validated['numero_court'],
        'KEYWORD'        => $validated['keyword'],
        'TYPE'           => $validated['type'],
        'PRIX'           => $validated['prix'],
    ]);

    return redirect()->route('services.index');
}


   public function edit(Service $service)
{
    return Inertia::render('Services/Edit', [
        'service' => $service  // ← obligatoire
    ]);
}


    public function update(Request $request, Service $service)
{
    $validated = $request->validate([
        'nom_service'    => 'required|string|max:100',   // ← minuscules
        'nom_fournisseur'=> 'required|string|max:100',
        'numero_court'   => 'nullable|string|max:20',
        'keyword'        => 'nullable|string|max:50',
        'type'           => 'nullable|string|max:50',
        'prix'           => 'nullable|numeric'
    ]);

    // Mapper vers les colonnes DB en majuscules
    $service->update([
        'NOM_SERVICE'    => $validated['nom_service'],
        'NOM_FOURNISSEUR'=> $validated['nom_fournisseur'],
        'NUMERO_COURT'   => $validated['numero_court'],
        'KEYWORD'        => $validated['keyword'],
        'TYPE'           => $validated['type'],
        'PRIX'           => $validated['prix'],
    ]);

    return redirect()->route('services.index');
}


    public function destroy(Service $service)
    {
        $service->delete();

        return redirect()->route('services.index');
    }
}