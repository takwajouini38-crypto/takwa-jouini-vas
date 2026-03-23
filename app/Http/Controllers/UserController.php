<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // ✅ Liste des utilisateurs + recherche
    public function index(Request $request)
    {
        $query = User::select('id', 'name', 'email', 'role', 'created_at');

        // 🔍 Recherche
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('role', 'like', '%' . $request->search . '%');
            });
        }

        $users = $query->orderBy('id', 'asc')
                       ->paginate(10)
                       ->withQueryString(); // 🔥 important pour garder la recherche

        return Inertia::render('Admin/Users/Users', [
            'users' => $users,
            'filters' => $request->only('search'), // 🔥 pour React
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ]
        ]);
    }

    // ✅ Formulaire création
    public function create()
    {
        return Inertia::render('Admin/Users/Create');
    }

    // ✅ Stocker un utilisateur
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => [
                'required',
                'string',
                'min:6',
                'regex:/[A-Z]/',
                'regex:/[0-9]/',
                'regex:/[@$!%*#?&]/',
            ],
            'role' => 'required',
        ], [
            'email.unique' => '❌ Cet email existe déjà',
            'password.min' => '❌ Mot de passe trop court (min 6)',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role' => $validated['role'],
        ]);

        return redirect()->route('admin.users.index')
            ->with('success', 'Utilisateur créé avec succès');
    }

    // ✅ Vérifier email (AJAX)
    public function checkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $exists = User::where('email', $request->email)->exists();

        return response()->json([
            'exists' => $exists
        ]);
    }

    // ✅ Formulaire édition
    public function edit(User $user)
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user
        ]);
    }

    // ✅ Mise à jour
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'role'  => 'required|string|in:admin,technicien,analyst_op,analyst_biz'
        ]);

        $user->update($validated);

        return redirect()->route('admin.users.index')
                         ->with('success', 'Utilisateur modifié avec succès');
    }

    // ✅ Suppression
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('admin.users.index')
                         ->with('success', 'Utilisateur supprimé avec succès');
    }
}