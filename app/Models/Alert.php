<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Alert extends Model
{
    use HasFactory;

    /**
     * Nom de la table en base de données.
     */
    protected $table = 'alerts';

    /**
     * Colonnes autorisées pour l'insertion (Mass Assignment).
     */
    protected $fillable = [
        'service_name',
        'provider',
        'avg_volume',
        'current_volume',
        'increase_pct',
        'motif',
        'detected_at'
    ];

    /**
     * Conversion automatique des types de données.
     */
    protected $casts = [
        'avg_volume'     => 'integer',
        'current_volume' => 'integer',
        'increase_pct'   => 'float',
        'detected_at'    => 'datetime', // Pour manipuler la date facilement avec Carbon
    ];

    /**
     * Optionnel : Scope pour filtrer les alertes critiques (> 50% par exemple)
     */
    public function scopeCritical($query)
    {
        return $query->where('increase_pct', '>', 50);
    }
}