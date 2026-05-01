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
            // Conversion explicite en entier 0 ou 1
            $isActive = $request->is_active ? 1 : 0;

            if ($isActive === 1) {
                DbConfig::query()->update(['is_active' => 0]);
            }

            DbConfig::create([
                'host'         => $request->host,
                'port'         => $request->port,
                'service_name' => $request->service_name,
                'username'     => $request->username,
                'password'     => $request->password,
                'is_active'    => $isActive, // Envoi de l'entier
            ]);

            return redirect()->route('admin.db.index')->with('success', 'Config enregistrée.');

        } catch (\Exception $e) {
            Log::error("Erreur d'insertion Oracle : " . $e->getMessage());
            return redirect()->back()->withErrors(['error' => "Erreur : " . $e->getMessage()]);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'host'         => 'required|ip',
            'port'         => 'required|integer|between:1,65535',
            'service_name' => 'required|string',
            'username'     => 'required|string',
        ]);

        try {
            $config = DbConfig::findOrFail($id);
            
            // Conversion explicite
            $isActive = $request->is_active ? 1 : 0;

            if ($isActive === 1) {
                DbConfig::where('id', '!=', $id)->update(['is_active' => 0]);
            }

            $config->host = $request->host;
            $config->port = $request->port;
            $config->service_name = $request->service_name;
            $config->username = $request->username;
            $config->is_active = $isActive; // Mise à jour avec l'entier
            
            if ($request->filled('password')) {
                $config->password = $request->password;
            }
            
            $config->save();

            return redirect()->route('admin.db.index')->with('success', 'Mise à jour réussie.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => "Erreur : " . $e->getMessage()]);
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
            // On utilise des entiers 0 et 1 explicitement
            DbConfig::query()->update(['is_active' => 0]);

            $config = DbConfig::findOrFail($id);
            $config->is_active = 1; // Forçage entier
            $config->save();

            $this->oracleService->configureConnection();

            return redirect()->back()->with('success', "Le serveur Oracle {$config->host} est activé.");
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => "Erreur : " . $e->getMessage()]);
        }
    }
}