<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceProvider extends Model
{
    protected $table = 'service_providers';

    protected $fillable = [
        'provider_name',
        'nationnalite',
        'id_fiscale',
        'adresse'
    ];

    // Relation avec les services (si vous voulez lier un fournisseur à ses services SMS+)
    public function services(): HasMany
    {
        // On suppose que ServiceSmsPlus a une colonne fournisseur_id
        return $this->hasMany(ServiceSmsPlus::class, 'nom_fournisseur', 'nom');
    }
}