<?php

namespace App\Services;

use App\Models\DbConfig;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;

class OracleConnectorService
{
    /**
     * Configure dynamiquement la connexion 'oracle_dynamic' à partir de la BDD.
     * Utilisé pour les traitements réels (ETL, Rapports).
     */
    public function configureConnection()
    {
        $config = DbConfig::where('is_active', true)->first();

        if (!$config) {
            throw new \Exception("Aucune configuration Oracle active trouvée dans la table db_configs.");
        }

        Config::set('database.connections.oracle_dynamic', [
            'driver'        => 'oracle',
            'host'          => $config->host,
            'port'          => $config->port,
            'database'      => $config->service_name,
            'username'      => $config->username,
            'password'      => $config->password, // Décrypté automatiquement par le Model
            'charset'       => 'AL32UTF8',
            'prefix'        => '',
            'prefix_schema' => '',
        ]);

        DB::purge('oracle_dynamic');
    }

    /**
     * Teste la connexion active enregistrée en base de données.
     */
    public function testConnection(): bool
    {
        try {
            $this->configureConnection();
            DB::connection('oracle_dynamic')->getPdo();
            return true;
        } catch (\Exception $e) {
            \Log::error("Erreur de connexion Oracle (Service) : " . $e->getMessage());
            return false;
        }
    }

    /**
     * Teste une configuration spécifique SANS l'enregistrer.
     * Très utile pour le bouton "Tester" de ton interface administrateur.
     */
    public function testConnectionWithParams(array $params): bool
    {
        try {
            // On crée une connexion temporaire 'oracle_test'
            Config::set('database.connections.oracle_test', [
                'driver'   => 'oracle',
                'host'     => $params['host'],
                'port'     => $params['port'],
                'database' => $params['service_name'],
                'username' => $params['username'],
                'password' => $params['password'], // Mot de passe brut venant du formulaire
                'charset'  => 'AL32UTF8',
            ]);

            // Forcer Laravel à oublier une éventuelle ancienne connexion de test
            DB::purge('oracle_test');
            
            // Tentative de connexion réelle
            DB::connection('oracle_test')->getPdo();
            
            return true;
        } catch (\Exception $e) {
            // Optionnel : tu peux loguer l'erreur pour le debug
            return false;
        }
    }
}