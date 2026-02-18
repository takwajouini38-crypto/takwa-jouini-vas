import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function OperationalDashboard({ auth }) {
  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Dashboard Opérationnel" />

      <div className="p-6">
        <h1 className="text-2xl font-bold text-green-700">
          ⚙️ Dashboard Analyste Opérationnelle
        </h1>

        <p className="mt-4">
          Ici tu afficheras les statistiques techniques et opérationnelles.
        </p>
      </div>
    </AuthenticatedLayout>
  );
}
