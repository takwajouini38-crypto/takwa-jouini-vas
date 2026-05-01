<?php

namespace App\Http\Controllers\AnalysteBiz;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiAnalysisController extends Controller
{
    public function analyzeRevenue(Request $request)
    {
        // Récupération des données du graphique
        $data = $request->input('chartData');
        $context = $request->input('context'); 

        // Construction du prompt spécifique à Tunisie Télécom
        $prompt = "En tant qu'expert BI chez Tunisie Télécom, analyse ces données de revenus pour : $context. 
        Données : " . json_encode($data) . "
        Fais une analyse très courte (3 points clés maximum) sur les performances et suggère une action stratégique.";

        try {
            // Appel à l'API Groq (Gratuit, sans expiration de clé)
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.groq.key'),
                'Content-Type' => 'application/json',
            ])->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => 'llama-3.3-70b-versatile',
                'messages' => [
                    ['role' => 'system', 'content' => 'Tu es un analyste business expert en télécoms.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => 0.6,
            ]);

            if ($response->failed()) {
                Log::error("Erreur Groq: " . $response->body());
                return response()->json(['error' => 'L\'IA Groq est temporairement indisponible.'], 500);
            }

            return response()->json([
                'analysis' => $response->json()['choices'][0]['message']['content']
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur de connexion serveur'], 500);
        }
    }
}