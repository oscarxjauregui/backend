import { BrowserRouter, Routes, Route } from "react-router-dom";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
const stripePromise = loadStripe(
  "pk_test_51RSvqBI8PAfLPUB0yeATJ8FwwYK59oBgUaxzKeOO5xIB47AOe7IrA0eY0McFZiOWQQGVJUEhh1MepreWb2jxRaIZ00HKJtp4uL"
);

import { AuthProvider } from "./context/AuthContext";
import { VuelosProvider } from "./context/VuelosContext";
import { VuelosByDestinoProvider } from "./context/VuelosByDestinoContext";
import { VueloProvider } from "./context/VueloByIdContext";
import { MyReservationsProvider } from "./context/MyReservationsContext";
import { AdminVuelosProvider } from "./context/AdminVuelosContex";
import { UsersProvider } from "./context/UsersContext";
import { NominaProvider } from "./context/NominaContext";
import { ReportesProvider } from "./context/ReportesContext";
import { TicketProvider } from "./context/TicketContext";

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
import TicketPage from "./pages/TicketPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import VueloStatusPage from "./pages/VueloStatusPage";

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
                      <TicketProvider>
                        <Elements stripe={stripePromise}>
                          <BrowserRouter>
                            <Navbar />
                            <Routes>
                              <Route path="/" element={<HomePage />} />
                              <Route path="/login" element={<LoginPage />} />
                              <Route
                                path="/register"
                                element={<RegisterPage />}
                              />
                              <Route
                                path="/reservar/:id"
                                element={<VueloDetailsPage />}
                              />
                              <Route
                                path="/vuelos/:destino"
                                element={<VuelosByDestinoPage />}
                              />

                              <Route
                                path="/EstadoVuelos"x
                                element={<VueloStatusPage />}
                              />

                              <Route element={<ProtectedRoute />}>
                                <Route
                                  path="/profile"
                                  element={<ProfilePage />}
                                />
                                <Route
                                  path="/myreservations"
                                  element={<MyReservations />}
                                />
                                <Route
                                  path="/payment-success"
                                  element={<PaymentSuccessPage />}
                                />
                                <Route
                                  path="/myreservations/:id/ticket" // :id será el ID de la reservación
                                  element={<TicketPage />}
                                />
                              </Route>

                              <Route
                                element={
                                  <ProtectedRoute requiredRole="admin" />
                                }
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
                        </Elements>
                      </TicketProvider>
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
