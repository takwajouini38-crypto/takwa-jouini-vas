<?php

namespace App\Http\Controllers;

use App\Models\Alert; // Indispensable pour interagir avec la table alerts
use Illuminate\Http\Request;
use Inertia\Inertia; // Indispensable pour rendre la vue avec React
use Inertia\Response;

class AlertController extends Controller
{
    /**
     * Affiche l'historique des alertes pour l'analyste business.
     */
    public function index(): Response
    {
        return Inertia::render('AnalysteBiz/History', [
            'alerts' => Alert::orderBy('detected_at', 'desc')->get()
        ]);
    }

    /**
     * Met à jour le motif d'une alerte spécifique.
     */
    public function updateMotif(Request $request, Alert $alert)
    {
        // Validation des données entrantes
        $request->validate([
            'motif' => 'required|string|max:500'
        ]);

        // Mise à jour en base de données
        $alert->update([
            'motif' => $request->motif
        ]);

        // Retourne à la page précédente avec un message de succès
        return back()->with('success', 'Le motif a été enregistré avec succès.');
    }
}