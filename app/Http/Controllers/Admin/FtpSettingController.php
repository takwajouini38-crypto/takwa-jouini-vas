<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FtpSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FtpSettingController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Ftp/Index', [
            'ftps' => FtpSetting::all()
        ]);
    }

  public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'host' => 'required|ip',
            'port' => 'required|integer|between:1,65535',
            'username' => 'required|string',
            'password' => 'required|string',
            'is_default' => 'nullable|integer' // Ajout de la validation
        ], [
            'host.ip' => "L'adresse hôte doit être une adresse IP valide (ex: 192.168.1.1).",
            'port.between' => "Le port doit être un numéro valide entre 1 et 65535."
        ]);

        // LOGIQUE : Si le nouveau serveur est défini par défaut, on désactive les autres
        if ($request->is_default == 1) {
            FtpSetting::query()->update(['is_default' => 0, 'is_active' => 0]);
        }

        // On inclut 'is_default' et on force 'is_active' à 1 si c'est le défaut
        FtpSetting::create([
            'name'     => $request->name,
            'host'     => $request->host,
            'port'     => $request->port,
            'username' => $request->username,
            'password' => $request->password,
            'is_default' => $request->is_default ?? 0,
            'is_active'  => ($request->is_default == 1) ? 1 : 0,
        ]);

        return back()->with('success', 'FTP ajouté');
    }
   public function update(Request $request, $id)
    {
        $ftp = FtpSetting::findOrFail($id);
        
        // On récupère les données et on inclut 'is_default'
        $data = $request->only(['name', 'host', 'port', 'username', 'is_default']);
        
        if ($request->filled('password')) {
            $data['password'] = $request->password;
        }

        // LOGIQUE : Si on définit ce serveur comme défaut, on désactive les autres
        if ($request->is_default == 1) {
            FtpSetting::where('id', '!=', $id)->update(['is_default' => 0, 'is_active' => 0]);
            $data['is_active'] = 1;
        }

        $ftp->update($data);
        return back()->with('success', 'FTP modifié');
    }

   public function destroy($id)
{
    $ftp = FtpSetting::findOrFail($id);
    $ftp->delete();

    // TRÈS IMPORTANT : Retourner back() pour qu'Inertia recharge les données
    return redirect()->back()->with('success', 'Serveur FTP supprimé avec succès');
}

    public function setActive($id)
    {
        // On remet tout à 0 (is_active et is_default)
        FtpSetting::query()->update(['is_default' => 0, 'is_active' => 0]);

        $ftp = FtpSetting::findOrFail($id);
        $ftp->is_default = 1;
        $ftp->is_active = 1;
        $ftp->save();

        return back()->with('success', 'FTP activé');
    }

   public function testConnection(Request $request)
{
    // 1. On tente d'abord la connexion SSL (obligatoire pour ton serveur actuel)
    $conn = @ftp_ssl_connect($request->host, $request->port, 5); // timeout de 5 sec

    // 2. Si SSL échoue, on tente le FTP classique (fallback)
    if (!$conn) {
        $conn = @ftp_connect($request->host, $request->port, 5);
    }

    if (!$conn) {
        return response()->json([
            'status' => 'error', 
            'message' => 'Hôte introuvable ou port fermé'
        ]);
    }

    // 3. Tentative de login
    $login = @ftp_login($conn, $request->username, $request->password);

    if ($login) {
        ftp_pasv($conn, true); // Test du mode passif aussi
        ftp_close($conn);
        return response()->json([
            'status' => 'success', 
            'message' => 'Connexion établie avec succès !'
        ]);
    }

    @ftp_close($conn);
    return response()->json([
        'status' => 'error', 
        'message' => 'Identifiants incorrects ou sécurité (AUTH) requise'
    ]);
}
}