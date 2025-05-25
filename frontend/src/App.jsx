import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { VuelosProvider } from "./context/VuelosContext";
import { VuelosByDestinoProvider } from "./context/VuelosByDestinoContext";
import { VueloProvider } from "./context/VueloByIdContext";
import { MyReservationsProvider } from "./context/MyReservationsContext";
import { AdminVuelosProvider } from "./context/AdminVuelosContex";
import { UsersProvider } from "./context/UsersContext";
import { NominaProvider } from "./context/NominaContext";
import { ReportesProvider } from "./context/ReportesContext";

import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import VueloDetailsPage from "./pages/VueloDetailsPage";
import VuelosByDestinoPage from "./pages/VuelosByDestinoPage";
import MyReservations from "./pages/MyReservationsPage";
import PanelAdminPage from "./pages/PanelAdminPage";
import AdminVuelosPage from "./pages/AdminVuelosPage";
import AdminUsuariosPage from "./pages/AdminUsuariosPages";
import AdminStatusPage from "./pages/AdminStatusPage";
import NominaPage from "./pages/NominaPage";
import ReportesPage from "./pages/ReportesPage";
import GraficasPage from "./pages/GraficasPage";

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
                <UsersProvider>
                  <NominaProvider>
                    <ReportesProvider>
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

                          <Route
                            element={<ProtectedRoute requiredRole="admin" />}
                          >
                            <Route
                              path="/admin/panel"
                              element={<PanelAdminPage />}
                            />
                            <Route
                              path="/admin/vuelos"
                              element={<AdminVuelosPage />}
                            />
                            <Route
                              path="/admin/usuarios"
                              element={<AdminUsuariosPage />}
                            />
                            <Route
                              path="/admin/status"
                              element={<AdminStatusPage />}
                            />
                            <Route
                              path="/admin/nomina"
                              element={<NominaPage />}
                            />
                            <Route
                              path="/admin/reportes"
                              element={<ReportesPage />}
                            />
                            <Route
                              path="/admin/graficas"
                              element={<GraficasPage />}
                            />
                          </Route>
                        </Routes>
                      </BrowserRouter>
                    </ReportesProvider>
                  </NominaProvider>
                </UsersProvider>
              </AdminVuelosProvider>
            </VueloProvider>
          </VuelosByDestinoProvider>
        </VuelosProvider>
      </MyReservationsProvider>
    </AuthProvider>
  );
}

export default App;
