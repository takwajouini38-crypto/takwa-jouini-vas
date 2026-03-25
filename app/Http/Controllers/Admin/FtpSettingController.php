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
            'host' => 'required',
            'port' => 'required',
            'username' => 'required',
            'password' => 'required',
        ]);

        FtpSetting::create($request->only([
            'name','host','port','username','password'
        ]));

        return back()->with('success', 'FTP ajouté');
    }

    public function update(Request $request, $id)
{
    $ftp = FtpSetting::findOrFail($id);
    $data = $request->only(['name','host','port','username']);
    
    if ($request->filled('password')) {
        $data['password'] = $request->password;
    }

    $ftp->update($data);
    return back()->with('success', 'FTP modifié');
}

    public function destroy($id)
    {
        FtpSetting::destroy($id);
        return back()->with('success', 'FTP supprimé');
    }

    public function setActive($id)
    {
        FtpSetting::query()->update(['is_default' => false]);

        $ftp = FtpSetting::findOrFail($id);
        $ftp->is_default = true;
        $ftp->is_active = true;
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