<?php
// app/Http/Controllers/Admin/FtpServerController.php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FtpServer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class FtpServerController extends Controller
{
    public function index()
    {
        $servers = FtpServer::orderBy('priority')->get();
        return Inertia::render('Admin/Ftpserver', [
            'servers' => $servers
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'host' => 'required|string|max:255',
            'port' => 'required|integer|min:1|max:65535',
            'username' => 'required|string|max:255',
            'password' => 'required|string',
            'remote_path' => 'nullable|string|max:500',
            'priority' => 'required|integer|min:1',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        FtpServer::create($request->all());

        return redirect()->route('admin.ftp.index')
            ->with('success', 'Serveur FTP ajouté avec succès.');
    }

    public function update(Request $request, FtpServer $ftpServer)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'host' => 'required|string|max:255',
            'port' => 'required|integer|min:1|max:65535',
            'username' => 'required|string|max:255',
            'password' => 'nullable|string', // permet de ne pas changer le mot de passe
            'remote_path' => 'nullable|string|max:500',
            'priority' => 'required|integer|min:1',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $data = $request->except('password');
        if ($request->filled('password')) {
            $data['password'] = $request->password;
        }

        $ftpServer->update($data);

        return redirect()->route('admin.ftp.index')
            ->with('success', 'Serveur FTP mis à jour.');
    }

    public function destroy(FtpServer $ftpServer)
    {
        $ftpServer->delete();
        return redirect()->route('admin.ftp.index')
            ->with('success', 'Serveur FTP supprimé.');
    }

    public function testConnection(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'host' => 'required|string',
            'port' => 'required|integer',
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Données invalides'], 422);
        }

        $host = $request->host;
        $port = $request->port;
        $username = $request->username;
        $password = $request->password;

        $conn = @ftp_connect($host, $port, 30); // timeout 30s
        if (!$conn) {
            return response()->json(['success' => false, 'message' => 'Impossible de se connecter au serveur FTP.']);
        }

        $login = @ftp_login($conn, $username, $password);
        if (!$login) {
            ftp_close($conn);
            return response()->json(['success' => false, 'message' => 'Échec de l\'authentification.']);
        }

        ftp_close($conn);
        return response()->json(['success' => true, 'message' => 'Connexion FTP réussie.']);
    }
}