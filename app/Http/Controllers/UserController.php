<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    // Liste des utilisateurs
    public function index()
    {
         // On récupère tous les utilisateurs sauf les admins
        $users = User::where('role', '!=', 'admin')->get();
        return Inertia::render('Admin/Users', [ // <-- ici le chemin correspond au dossier
        'users' => $users,
    ]);
    }

    // Supprimer un utilisateur
    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('users.index')->with('success', 'Utilisateur supprimé avec succès.');
    }
}

