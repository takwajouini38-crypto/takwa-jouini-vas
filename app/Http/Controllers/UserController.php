<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // Liste des utilisateurs
    public function index()
    {
        $users = User::select('id', 'name', 'email', 'role', 'created_at')
                     ->orderBy('id', 'desc')
                     ->paginate(10);

        return Inertia::render('Admin/Users/Users', [
            'users' => $users,
            'flash' => session('flash')
        ]);
    }

    // Formulaire création
    public function create()
    {
        return Inertia::render('Admin/Users/Create');
    }

    // Stocker un utilisateur
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role'     => 'required|string|in:admin,technicien,analyst_op,analyst_biz'
        ], [
            'email.unique' => 'Cet email est déjà utilisé par un autre utilisateur.'
        ]);

        User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role'     => $validated['role']
        ]);

        return redirect()->route('admin.users.index')
                         ->with('flash', ['success' => 'Utilisateur créé avec succès.']);
    }

    // Formulaire édition
    public function edit(User $user)
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user
        ]);
    }

    // Mettre à jour un utilisateur
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'role'  => 'required|string|in:admin,technicien,analyst_op,analyst_biz'
        ]);

        $user->update($validated);

        return redirect()->route('admin.users.index')
                         ->with('flash', ['success' => 'Utilisateur modifié avec succès.']);
    }

    // Supprimer un utilisateur
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('admin.users.index')
                         ->with('flash', ['success' => 'Utilisateur supprimé avec succès.']);
    }
}