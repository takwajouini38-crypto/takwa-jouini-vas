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
        $service->delete();

        return redirect()->route('services.index');
    }
}