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
    // Récupérer tous les utilisateurs sauf admin
    $users = User::where('role', '!=', 'admin')->get();

    // Renvoyer via Inertia + info utilisateur connecté
    return Inertia::render('Admin/Users', [
        'users' => $users,
        'auth' => [
            'user' => auth()->user(),
        ],
    ]);
}


    // Supprimer un utilisateur
    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('users.index')->with('success', 'Utilisateur supprimé avec succès.');
    }
}

