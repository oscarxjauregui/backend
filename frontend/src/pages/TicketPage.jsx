// src/pages/TicketPage.jsx
import { useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useTicket } from "../context/TicketContext";
import { QRCode } from "react-qrcode-logo";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const TicketPage = () => {
  const { id: reservationId } = useParams();
  const { ticketData, loading, error, fetchTicketById } = useTicket();
  const ticketRef = useRef(null);

  useEffect(() => {
    if (reservationId) {
      fetchTicketById(reservationId);
    }
  }, [reservationId, fetchTicketById]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };

      let date;
      date = new Date(dateString);

      if (
        isNaN(date.getTime()) &&
        dateString.includes("/") &&
        dateString.includes(" ")
      ) {
        const [datePart, timePart] = dateString.split(" ");
        const [day, month, year] = datePart.split("/");
        date = new Date(`${year}-${month}-${day}T${timePart}:00`);
      } else if (isNaN(date.getTime()) && dateString.includes("/")) {
        const [day, month, year] = dateString.split("/");
        date = new Date(`${year}-${month}-${day}`);
      }

      if (!isNaN(date.getTime())) {
        return date.toLocaleString("es-ES", options);
      }
      return "Fecha inválida";
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Fecha inválida";
    }
  }, []);

  const handleDownloadPDF = async () => {
    const input = ticketRef.current;
    if (!input) {
      alert(
        "No se pudo encontrar el contenido del ticket para generar el PDF."
      );
      return;
    }

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = pdf.internal.pageSize.getWidth() - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(
        `ticket_${ticketData?.vueloId?.origen}_${ticketData?.vueloId?.destino}_${ticketData?.userId?.nombre}.pdf`
      );
    } catch (error) {
      console.error("Error al generar el PDF del ticket:", error);
      alert(
        "Error al generar el PDF del ticket. Revisa la consola para más detalles."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 pt-16 justify-center items-center">
        <p className="text-xl text-gray-600">Cargando ticket...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 pt-16 justify-center items-center">
        <p className="text-xl text-red-600 mb-4">
          Error al cargar el ticket: {error}
        </p>
        <Link
          to="/myreservations"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 transition duration-200"
        >
          Volver a Mis Reservaciones
        </Link>
      </div>
    );
  }

  if (!ticketData || !ticketData.vueloId || !ticketData.userId) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 pt-16 justify-center items-center">
        <p className="text-xl text-gray-600 mb-4">
          No se encontró el ticket o los detalles del vuelo/usuario.
        </p>
        <Link
          to="/myreservations"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 transition duration-200"
        >
          Volver a Mis Reservaciones
        </Link>
      </div>
    );
  }

  // Datos para el QR Code
  const qrData = JSON.stringify({
    resId: ticketData._id,
    user: `${ticketData.userId.nombre} ${ticketData.userId.apellido}`,
    vuelo: `${ticketData.vueloId.origen}-${ticketData.vueloId.destino}`,
    fecha: formatDate(ticketData.vueloId.fechaSalida),
    asientos: ticketData.asientos,
    aerolinea: ticketData.vueloId.aerolinea,
    estado: ticketData.vueloId.estado,
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 pt-16">
      <main className="flex-grow container mx-auto px-6 py-8 flex justify-center items-center">
        <div
          ref={ticketRef}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden relative w-full max-w-2xl transform transition-all duration-300 hover:scale-[1.01]"
          style={{
            border: "2px dashed #3B82F6",
            padding: "2rem",
            background: "linear-gradient(135deg, #F0F4F8 0%, #FFFFFF 100%)",
          }}
        >
          <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-4 bg-gray-50 z-10">
            <div className="absolute left-0 w-8 h-8 bg-gray-50 rounded-full -ml-4"></div>
            <div className="absolute right-0 w-8 h-8 bg-gray-50 rounded-full -mr-4"></div>
          </div>
          <div className="relative z-20">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200 border-dashed">
              <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight">
                VUELAZOS XD
              </h1>
              <div className="text-right">
                <p className="text-sm text-gray-600">Aerolínea</p>
                <p className="text-xl font-bold text-gray-900">
                  {ticketData.vueloId.aerolinea}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-4 mb-8">
              <div>
                <p className="text-xs uppercase text-gray-500">Origen</p>
                <p className="text-2xl font-bold text-gray-900">
                  {ticketData.vueloId.origen}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Destino</p>
                <p className="text-2xl font-bold text-gray-900">
                  {ticketData.vueloId.destino}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">
                  Fecha de Salida
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {formatDate(ticketData.vueloId.fechaSalida)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">
                  Fecha de Llegada
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {formatDate(ticketData.vueloId.fechaLlegada)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Asientos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {ticketData.asientos}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Costo Total</p>
                <p className="text-2xl font-bold text-emerald-600">
                  ${(ticketData.vueloId.costo * ticketData.asientos).toFixed(2)}{" "}
                  MXN
                </p>
              </div>
            </div>
            {/* Detalles del Pasajero */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4 mb-8 pt-4 border-t-2 border-gray-200 border-dashed">
              <div>
                <p className="text-xs uppercase text-gray-500">Pasajero</p>
                <p className="text-xl font-bold text-gray-900">
                  {ticketData.userId.nombre} {ticketData.userId.apellido}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Email</p>
                <p className="text-lg text-gray-900">
                  {ticketData.userId.email}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center pt-6 border-t-2 border-gray-200 border-dashed">
              <p className="text-sm text-gray-600 mb-2">
                Escanea para detalles de embarque
              </p>
              <div className="bg-white p-2 rounded-lg shadow-inner">
                <QRCode
                  value={qrData}
                  size={128}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ID de Reservación: {ticketData._id}
              </p>
            </div>
          </div>
        </div>
      </main>

      <div className="flex justify-center gap-4 py-8 bg-gray-50">
        <Link
          to="/myreservations"
          className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Volver a Mis Reservaciones
        </Link>
        <button
          onClick={handleDownloadPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md flex items-center"
        >
          Descargar Ticket PDF
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-6">
        <p className="text-lg">
          ¿Tienes dudas? Escríbenos a contacto@aerolinea.com
        </p>
        <p className="text-sm mt-2">
          &copy; {new Date().getFullYear()} Aerolínea. Todos los derechos
          reservados.
        </p>
      </footer>
    </div>
  );
};

export default TicketPage;
