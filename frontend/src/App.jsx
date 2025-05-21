import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { VuelosProvider } from "./context/VuelosContext";
import { VuelosByDestinoProvider } from "./context/VuelosByDestinoContext";
import { VueloProvider } from "./context/VueloByIdContext";
import { MyReservationsProvider } from "./context/MyReservationsContext";
import { AdminVuelosProvider } from "./context/AdminVuelosContex";
import { UserProvider } from "./context/UsersContext";

import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import VueloDetailsPage from "./pages/VueloDetailsPage";
import VuelosByDestinoPage from "./pages/VuelosByDestinoPage";
import MyReservations from "./pages/MyReservationsPage";
import PanelAdminPage from "./pages/PanelAdminPage";
import AdminVuelosPage from "./pages/AdminVuelosPage";

import ProtectedRoute from "./ProtectedRoute";
import Navbar from "./components/Navbar";

function App() {
  return (
    <AuthProvider>
      <MyReservationsProvider>
        <VuelosProvider>
          <VuelosByDestinoProvider>
            <VueloProvider>
              <AdminVuelosProvider>
                {/* Envuelve AdminVuelosProvider y cualquier otro componente que necesite UserContext */}
                {/* Puedes poner UserProvider más arriba si otros contextos o rutas lo necesitan */}
                <UserProvider>
                  {" "}
                  {/* ¡Añade el UserProvider aquí! */}
                  <BrowserRouter>
                    <Navbar />
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route
                        path="/reservar/:id"
                        element={<VueloDetailsPage />}
                      />
                      <Route
                        path="/vuelos/:destino"
                        element={<VuelosByDestinoPage />}
                      />

                      <Route element={<ProtectedRoute />}>
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route
                          path="/myreservations"
                          element={<MyReservations />}
                        />
                      </Route>

                      <Route element={<ProtectedRoute requiredRole="admin" />}>
                        <Route
                          path="/admin/panel"
                          element={<PanelAdminPage />}
                        />
                        <Route
                          path="/admin/vuelos"
                          element={<AdminVuelosPage />}
                        />{" "}
                      </Route>
                    </Routes>
                  </BrowserRouter>
                </UserProvider>{" "}
                {/* Cierra el UserProvider aquí */}
              </AdminVuelosProvider>
            </VueloProvider>
          </VuelosByDestinoProvider>
        </VuelosProvider>
      </MyReservationsProvider>
    </AuthProvider>
  );
}

export default App;
