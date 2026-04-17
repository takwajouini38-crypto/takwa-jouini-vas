<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\DB;
class ServiceSmsPlus extends Model
{
    protected $table = 'services_sms_plus';
    protected $fillable = [
       'service_name',
       'short_code',
       'keyword',
        'type',
        'price'
    ];
    protected $casts = [
        'price' => 'float',
    ];

public function provider()
{
    return $this->belongsTo(ServiceProvider::class, 'provider_id');
}



    // Relation OCC
    public function occAggregates(): HasMany
    {
        return $this->hasMany(RaTOccAgg::class, 'keyword', 'keyword');
    }

    // Relation dernier OCC
    public function lastOccAggregate(): HasOne
    {
        return $this->hasOne(RaTOccAgg::class, 'keyword', 'keyword')
                    ->latest('start_date');
    }

    // Relation MMG
    public function mmgAggregates(): HasMany
    {
        return $this->hasMany(RaTMmgAgg::class, 'service_type', 'keyword');
    }

    // CA total
    public function getTotalRevenueAttribute(): float
    {
        return $this->occAggregates()->sum('charge_amount');
    }

    // CDR total
    public function getTotalCdrCountAttribute(): int
    {
        return $this->occAggregates()->sum('cdr_count');
    }

    // CDR total MMG
    public function getTotalCdrMmgAttribute(): int
    {
        return $this->mmgAggregates()->sum('cdr_count');
    }

    // Scope services actifs
    public function scopeActive($query)
    {
        return $query->whereNotNull('keyword');
    }

    // Scope type
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    // Scope fournisseur
    public function scopeByFournisseur($query, string $fournisseur)
    {
        return $query->where('nom_fournisseur', $fournisseur);
    }

public static function topServices($limit = 20, $startDate = null, $endDate = null)
{
    return self::select(
            'services_sms_plus.*',
            DB::raw('SUM(ra_t_occ_agg.charge_amount) as total_revenue')
        )
        ->leftJoin('ra_t_occ_agg', 'services_sms_plus.keyword', '=', 'ra_t_occ_agg.keyword')
        ->when($startDate && $endDate, function ($query) use ($startDate, $endDate) {
            $query->whereBetween('ra_t_occ_agg.start_date', [$startDate, $endDate]);
        })
        ->groupBy(
            'services_sms_plus.id',
            'services_sms_plus.nom_service',
            'services_sms_plus.nom_fournisseur',
            'services_sms_plus.numero_court',
            'services_sms_plus.keyword',
            'services_sms_plus.type',
            'services_sms_plus.prix',
            'services_sms_plus.created_at',
            'services_sms_plus.updated_at'
        )
        ->orderByDesc('total_revenue')
        ->limit($limit)
        ->get();
}

    // CA sur période
    public function revenueBetween(string $startDate, string $endDate): float
    {
        return $this->occAggregates()
                    ->betweenDates($startDate, $endDate)
                    ->sum('charge_amount');
    }

    // CDR sur période
    public function cdrBetween(string $startDate, string $endDate): int
    {
        return $this->occAggregates()
                    ->betweenDates($startDate, $endDate)
                    ->sum('cdr_count');
    }
}