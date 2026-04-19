<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DbConfig;
use App\Services\OracleConnectorService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class DbConfigController extends Controller
{
    protected $oracleService;

    public function __construct(OracleConnectorService $oracleService)
    {
        $this->oracleService = $oracleService;
    }

    public function index()
    {
        return Inertia::render('Admin/dbconfig', [
            'configs' => DbConfig::orderBy('created_at', 'desc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'host'         => 'required|ip',// Vérifie le format d'adresse IP (v4 ou v6)
            'port'         => 'required|integer|between:1,65535',
            'service_name' => 'required|string|regex:/^[a-zA-Z_]+$/', // Uniquement lettres et underscore',
            'username'     => 'required|string',
            'password'     => 'required|string',
            'is_active'    => 'boolean'],
            ['host.ip' => "L'adresse hôte doit être une adresse IP valide (ex: 192.168.1.1).",
            'service_name.regex' => "Le nom du service ne peut contenir que des lettres (pas de chiffres ou de caractères spéciaux).",
            'port.between' => "Le port doit être un numéro valide entre 1 et 65535."
        ]);

        try {
            // Si on active cette config, on désactive les autres dans Oracle
            if ($request->is_active) {
                DbConfig::query()->update(['is_active' => false]);
            }

            // Insertion explicite
            DbConfig::create([
                'host'         => $request->host,
                'port'         => $request->port,
                'service_name' => $request->service_name,
                'username'     => $request->username,
                'password'     => $request->password,
                'is_active'    => $request->is_active ?? false,
            ]);

            return redirect()->route('admin.db.index')->with('success', 'Config enregistrée dans Oracle.');

        } catch (\Exception $e) {
            Log::error("Erreur d'insertion Oracle : " . $e->getMessage());
            return redirect()->back()->withErrors(['error' => "Erreur Oracle : " . $e->getMessage()]);
        }
    }

    public function update(Request $request, $id)
{
    // Validation des données entrantes
    $request->validate([
      'host'         => 'required|ip',// Vérifie le format d'adresse IP (v4 ou v6)
            'port'         => 'required|integer|between:1,65535',
            'service_name' => 'required|string|regex:/^[a-zA-Z_]+$/', // Uniquement lettres et underscore',
            'username'     => 'required|string',
            'password'     => 'required|string',
            'is_active'    => 'boolean'],[
            'host.ip' => "L'adresse hôte doit être une adresse IP valide.",
            'service_name.regex' => "Le nom du service ne doit comporter que des lettres.",
        ]);


    try {
        $config = DbConfig::findOrFail($id);

        // Si cette config est activée, on désactive toutes les autres
        if ($request->is_active) {
            DbConfig::where('id', '!=', $id)->update(['is_active' => false]);
        }

        // Mise à jour des champs sauf le mot de passe s'il est vide
        $config->fill($request->except('password'));
        
        if ($request->filled('password')) {
            $config->password = $request->password;
        }
        
        $config->save();

        return redirect()->route('admin.db.index')->with('success', 'Mise à jour réussie.');
    } catch (\Exception $e) {
        Log::error("Erreur de mise à jour Oracle ID {$id} : " . $e->getMessage());
        return redirect()->back()->withErrors(['error' => "Erreur lors de la modification : " . $e->getMessage()]);
    }
}

    public function destroy($id)
    {
        DbConfig::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Supprimé avec succès.');
    }

    public function testConnection(Request $request)
    {
        $params = $request->all();
        if (empty($params['password']) && $request->id) {
            $existing = DbConfig::find($request->id);
            $params['password'] = $existing->password; 
        }

        $isConnected = $this->oracleService->testConnectionWithParams($params);

        return response()->json([
            'success' => $isConnected,
            'message' => $isConnected ? 'Connexion réussie !' : 'Échec de la connexion Oracle.'
        ]);
    }
    public function setActive($id)
{
    try {
        // 1. Désactiver toutes les configurations Oracle
        DbConfig::query()->update(['is_active' => false]);

        // 2. Activer la configuration sélectionnée
        $config = DbConfig::findOrFail($id);
        $config->is_active = true;
        $config->save();

        // 3. (Optionnel) On force le service à configurer la nouvelle connexion immédiatement
        $this->oracleService->configureConnection();

        return redirect()->back()->with('success', "Le serveur Oracle {$config->host} est désormais la base active.");
    } catch (\Exception $e) {
        Log::error("Erreur lors de l'activation Oracle : " . $e->getMessage());
        return redirect()->back()->withErrors(['error' => "Impossible d'activer ce serveur : " . $e->getMessage()]);
    }
}
}