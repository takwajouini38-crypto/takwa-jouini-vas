<?php
// app/Http/Controllers/Admin/DbConfigController.php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DbConfig;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class DbConfigController extends Controller
{
    public function index()
    {
        $config = DbConfig::first();
        return Inertia::render('Admin/dbconfig', [
            'config' => $config
        ]);
    }

    public function storeOrUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'host' => 'required|string|max:255',
            'port' => 'required|integer|min:1|max:65535',
            'service_name' => 'required|string|max:255',
            'username' => 'required|string|max:255',
            'password' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $config = DbConfig::first();
        $data = $request->all();

        if (!$request->filled('password')) {
            unset($data['password']);
        }

        if ($config) {
            $config->update($data);
        } else {
            DbConfig::create($data);
        }

        return redirect()->route('admin.db.index')
            ->with('success', 'Configuration base de données mise à jour.');
    }

    public function testConnection(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'host' => 'required|string',
            'port' => 'required|integer',
            'service_name' => 'required|string',
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Données invalides'], 422);
        }

        // Création d'une configuration temporaire pour le test
        config(['database.connections.oracle_test' => [
            'driver'   => 'oracle',
            'host'     => $request->host,
            'port'     => $request->port,
            'database' => $request->service_name, // SID ou service name
            'username' => $request->username,
            'password' => $request->password,
            'charset'  => 'AL32UTF8',
            'prefix'   => '',
            'prefix_schema' => '',
        ]]);

        try {
            // Tentative de connexion via OCI8 (grâce au package yajra/laravel-oci8)
            DB::connection('oracle_test')->getPdo();
            return response()->json(['success' => true, 'message' => 'Connexion à la base de données réussie.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur de connexion : ' . $e->getMessage()]);
        }
    }
}