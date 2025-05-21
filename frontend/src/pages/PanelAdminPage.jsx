import { useNavigate } from "react-router-dom";
import {
  Plane,
  Users,
  Wallet,
  ActivitySquare,
  FileText,
  BarChart,
} from "lucide-react";

function AdminNavbar() {
  return (
    <header className="bg-gray-900 text-white px-6 py-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Panel Administrador</h1>
        <p className="text-gray-400 text-sm">Gestión general del sistema</p>
      </div>
    </header>
  );
}

export default function PanelAdmin() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Vuelos",
      description: "Gestión de vuelos disponibles",
      icon: (
        <Plane className="w-16 h-16 text-white p-3 bg-indigo-500 rounded-full" />
      ),
      route: "/admin/vuelos",
    },
    {
      title: "Usuarios",
      description: "Administración de clientes y staff",
      icon: (
        <Users className="w-16 h-16 text-white p-3 bg-green-500 rounded-full" />
      ),
      route: "/admin/usuarios",
    },
    {
      title: "Nómina",
      description: "Control de pagos y empleados",
      icon: (
        <Wallet className="w-16 h-16 text-white p-3 bg-yellow-500 rounded-full" />
      ),
      route: "/admin/nomina",
    },
    {
      title: "Status del vuelo",
      description: "Seguimiento en tiempo real",
      icon: (
        <ActivitySquare className="w-16 h-16 text-white p-3 bg-teal-500 rounded-full" />
      ),
      route: "/admin/status",
    },
    {
      title: "Reportes",
      description: "Informes administrativos",
      icon: (
        <FileText className="w-16 h-16 text-white p-3 bg-gray-600 rounded-full" />
      ),
      route: "/admin/reportes",
    },
    {
      title: "Gráficas",
      description: "Análisis visual de datos",
      icon: (
        <BarChart className="w-16 h-16 text-white p-3 bg-purple-500 rounded-full" />
      ),
      route: "/admin/graficas",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <AdminNavbar />

      <main className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-extrabold mb-10 text-center text-gray-800">
          Panel de Control
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-10">
          {sections.map((section) => (
            <div
              key={section.title}
              onClick={() => navigate(section.route)}
              className="cursor-pointer bg-white hover:bg-gray-50 transition-colors p-8 rounded-2xl shadow-2xl border border-gray-300 hover:shadow-2xl hover:scale-105 transform duration-300 ease-in-out"
            >
              <div className="flex flex-col items-center text-center">
                {section.icon}
                <h3 className="mt-6 text-2xl font-bold text-gray-800">
                  {section.title}
                </h3>
                <p className="text-gray-600 mt-2 text-sm">
                  {section.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
