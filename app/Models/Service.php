<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    // Nom de la table (optionnel si Laravel suit la convention plurielle)
    protected $table = 'services_sms_plus';

    // Clé primaire
    protected $primaryKey = 'ID';

    // Auto-incrément activé (vrai par défaut)
    public $incrementing = true;

    // Type de la clé primaire (int par défaut)
    protected $keyType = 'int';

    // Timestamps gérés par Laravel
    public $timestamps = true; // déjà true par défaut, mais explicite

    // Champs assignables en masse
    protected $fillable = [
        'NOM_FOURNISSEUR',
        'NOM_SERVICE',
        'NUMERO_COURT',
        'KEYWORD',
        'TYPE',
        'PRIX',
    ];

    // Conversion de types
    protected $casts = [
        'PRIX'        => 'float',
        'created_at'  => 'datetime',
        'updated_at'  => 'datetime',
    ];
}