<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceSmsPlus extends Model
{
    protected $table = 'services_sms_plus';
    
    protected $fillable = [
        'service_name',
        'short_code',
        'keyword',
        'type',
        'price',
        'provider_id' // 👈 N'oublie pas de l'ajouter ici pour pouvoir l'enregistrer
    ];

    protected $casts = [
        'price' => 'float',
    ];

    /**
     * Relation avec le Fournisseur
     */
    public function provider(): BelongsTo
    {
        // On précise bien la clé étrangère 'provider_id'
        return $this->belongsTo(ServiceProvider::class, 'provider_id');
    }

    /**
     * Relation avec la table de trafic OCC
     * Lie 'keyword' (services_sms_plus) à 'keyword' (ra_t_occ_agg)
     */
    public function occAggregates(): HasMany
    {
        return $this->hasMany(RaTOccAgg::class, 'keyword', 'keyword');
    }

    /**
     * Relation avec la table de trafic MMG
     * Lie 'keyword' (services_sms_plus) à 'service_type' (ra_t_mmg_agg)
     */
    public function mmgAggregates(): HasMany
    {
        return $this->hasMany(RaTMmgAgg::class, 'service_type', 'keyword');
    }
}