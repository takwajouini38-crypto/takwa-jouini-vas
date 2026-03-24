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

        $ftp->update($request->only([
            'name','host','port','username','password'
        ]));

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
        $conn = @ftp_connect($request->host, $request->port);

        if (!$conn) {
            return response()->json(['status' => 'error', 'message' => 'Connexion impossible']);
        }

        $login = @ftp_login($conn, $request->username, $request->password);

        ftp_close($conn);

        if (!$login) {
            return response()->json(['status' => 'error', 'message' => 'Login échoué']);
        }

        return response()->json(['status' => 'success', 'message' => 'Connexion OK']);
    }
}