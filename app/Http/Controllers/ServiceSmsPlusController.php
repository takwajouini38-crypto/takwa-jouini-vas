<?php

namespace App\Http\Controllers;

use App\Models\ServiceSmsPlus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceSmsPlusController extends Controller
{
    public function index()
    {
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

    $services = ServiceSmsPlus::orderBy('created_at', 'desc')->paginate(10);
    return Inertia::render('Services/Index', [
        'services' => $services,
        'flash' => [
            'success' => 'Service créé avec succès.'
        ]
    ])->with('url', route('services.index')); // Force l'URL à /services
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

    $services = ServiceSmsPlus::orderBy('created_at', 'desc')->paginate(10);
    return Inertia::render('Services/Index', [
        'services' => $services,
        'flash' => [
            'success' => 'Service modifié avec succès.'
        ]
    ])->with('url', route('services.index')); // Force l'URL à /services
}

   public function destroy(ServiceSmsPlus $service)
{
    $service->delete();
    $services = ServiceSmsPlus::orderBy('created_at', 'desc')->paginate(10);
    return Inertia::render('Services/Index', [
        'services' => $services,
        'flash' => [
            'success' => 'Service supprimé avec succès.'
        ]
    ])->with('url', route('services.index')); // Force l'URL à /services
}
}