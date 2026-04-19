<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Alert;

class AlertDetectionNotification extends Notification
{
    use Queueable;

    public $alert;

    /**
     * On passe l'objet Alert au constructeur
     */
    public function __construct(Alert $alert)
    {
        $this->alert = $alert;
    }

    /**
     * On définit le canal d'envoi (Mail)
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Le contenu du mail personnalisé avec les données réelles
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('⚠️ ALERTE : Hausse de trafic suspecte - ' . $this->alert->service_name)
            ->greeting('Bonjour l\'équipe Revenue Assurance,')
            ->line('Une anomalie de trafic a été détectée sur le réseau.')
            ->line('**Détails de l\'alerte :**')
            ->line('- **Service :** ' . $this->alert->service_name)
            ->line('- **Mot-clé :** ' . $this->alert->keyword)
            ->line('- **Volume Actuel :** ' . $this->alert->current_volume)
            ->line('- **Moyenne Habituelle :** ' . $this->alert->avg_volume)
            ->line('- **Hausse :** +' . $this->alert->increase_pct . '%')
            ->action('Consulter le Dashboard', url('/alerts'))
            ->line('Merci de vérifier s\'il s\'agit d\'une fraude ou d\'une campagne marketing.')
            ->salutation('Cordialement, Système VAS Monitoring.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'alert_id' => $this->alert->id,
            'increase' => $this->alert->increase_pct
        ];
    }
}