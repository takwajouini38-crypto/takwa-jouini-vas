import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function BusinessDashboard({ auth }) {
  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Dashboard Business" />

      <div className="p-6">
        <h1 className="text-2xl font-bold text-purple-700">
          📊 Dashboard Analyste Business
        </h1>

        <p className="mt-4">
          Ici tu afficheras les KPI, revenus VAS, reporting business.
        </p>
      </div>
    </AuthenticatedLayout>
  );
}
