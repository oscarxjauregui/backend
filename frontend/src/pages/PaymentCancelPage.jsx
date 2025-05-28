// src/pages/PaymentCancelPage.jsx
import { Link } from "react-router-dom";

function PaymentCancelPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-800 p-6">
      <h1 className="text-4xl font-bold mb-4">Pago Cancelado</h1>
      <p className="text-xl text-center mb-6">
        Has cancelado el proceso de pago. Tu reserva no ha sido confirmada.
      </p>
      <p className="text-lg text-center">
        Puedes intentar de nuevo o explorar otros vuelos.
      </p>
      <div className="mt-8 flex space-x-4">
        <Link
          to="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-200"
        >
          Explorar Vuelos
        </Link>
        <Link
          to="/myreservations"
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-200"
        >
          Mis Reservas
        </Link>
      </div>
    </div>
  );
}

export default PaymentCancelPage;
