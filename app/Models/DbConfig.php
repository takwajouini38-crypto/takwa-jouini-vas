<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class DbConfig extends Model
{
    use HasFactory;

    // FORCE l'utilisation de la connexion Oracle définie dans config/database.php
    protected $connection = 'oracle'; 
    
    protected $table = 'db_configs';

    protected $fillable = [
        'host', 'port', 'service_name', 'username', 'password', 'is_active'
    ];

    // Cryptage automatique pour la sécurité (PFE)
    public function getPasswordAttribute($value)
    {
        try {
            return $value ? Crypt::decryptString($value) : null;
        } catch (\Exception $e) {
            return $value; // Retourne brut si non crypté (pour éviter les crashs)
        }
    }

    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = $value ? Crypt::encryptString($value) : null;
    }
}