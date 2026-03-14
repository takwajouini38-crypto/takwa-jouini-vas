<?php

namespace App\Http\Controllers;

use App\Models\ServiceSmsPlus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceSmsPlusController extends Controller
{
    public function index()
    {
        $services = ServiceSmsPlus::latest()->get();
       $services = ServiceSmsPlus::orderBy('created_at', 'desc')->paginate(10);
        return Inertia::render('Services/Index', [
            'services' => $services
        ]);
    }

    public function create()
    {
        return Inertia::render('Services/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom_service' => 'required|string|max:255',
            'nom_fournisseur' => 'required|string|max:255',
            'numero_court' => 'required',
            'type' => 'required',
            'prix' => 'required|numeric'
        ]);

        ServiceSmsPlus::create($request->all());

        return redirect()->route('services.index');
    }

    public function edit(ServiceSmsPlus $service)
    {
        return Inertia::render('Services/Edit', [
            'service' => $service
        ]);
    }

    public function update(Request $request, ServiceSmsPlus $service)
    {
        $request->validate([
            'nom_service' => 'required|string|max:255',
            'nom_fournisseur' => 'required|string|max:255',
            'numero_court' => 'required',
            'type' => 'required',
            'prix' => 'required|numeric'
        ]);

        $service->update($request->all());

        return redirect()->route('services.index');
    }

    public function destroy(ServiceSmsPlus $service)
    {
        try {
            // Supprimer le service
            $service->delete();

            // Rediriger vers l'index avec un message de succès
            return redirect()->route('services.index')
                             ->with('success', 'Service supprimé avec succès');
        } catch (\Exception $e) {
            // En cas d'erreur, rediriger avec un message d'erreur
            return redirect()->route('services.index')
                             ->with('error', 'Impossible de supprimer le service : ' . $e->getMessage());
        }
    }
}