import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase, 
  FiCreditCard,
  FiArrowLeft,
} from "react-icons/fi"; 
import { useAuth } from "../context/AuthContext";

function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth(); 

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-6 bg-gray-100 rounded-lg">
          <p className="text-gray-900 mb-4">Cargando perfil...</p>
          <span className="inline-block h-8 w-8 border-4 border-black border-t-transparent rounded-full animate-spin"></span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-6 bg-gray-100 rounded-lg">
          <p className="text-gray-900 mb-4">
            Debes iniciar sesión para ver esta página.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-900 text-white py-6 px-4 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded-full transition"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
          <div className="w-8"></div> 
          
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-gray-100 rounded-xl shadow-md overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FiUser className="text-gray-900" />
              Información Personal
            </h2>
          </div>

          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-200 rounded-full text-gray-900">
                  <FiUser />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Nombre Completo
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {user.nombre} {user.apellido}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-200 rounded-full text-gray-900">
                  <FiMail />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Correo electrónico
                  </label>
                  <p className="text-gray-900">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-200 rounded-full text-gray-900">
                  <FiPhone />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Teléfono
                  </label>
                  <p className="text-gray-900">
                    {user.telefono || "No especificado"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-200 rounded-full text-gray-900">
                  <FiMapPin />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Dirección
                  </label>
                  <p className="text-gray-900">
                    {user.direccion || "No especificado"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-200 rounded-full text-gray-900">
                  <FiBriefcase />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Rol
                  </label>
                  <p className="text-gray-900">
                    {user.rol || "No especificado"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-200 rounded-full text-gray-900">
                  <FiCreditCard />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Pasaporte
                  </label>
                  {user.pasaporteImageUrl ? (
                    <img
                      src={user.pasaporteImageUrl}
                      alt="Pasaporte"
                      className="w-32 h-32 object-cover rounded-md border border-gray-400"
                    />
                  ) : (
                    <p className="text-gray-900">No proporcionado</p>
                  )}
                </div>
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Miembro desde
                </label>
                <p className="text-gray-900">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;