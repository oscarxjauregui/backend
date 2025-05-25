// src/pages/ReportesPage.jsx
import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useReportes } from "../context/ReportesContext";

const ReportesPage = () => {
  const reportRef = useRef();
  const {
    weeklyReport,
    monthlyReport,
    annualReport,
    clientReport,
    loading,
    error,
  } = useReportes();

  const handleDownloadPDF = async () => {
    const input = reportRef.current;

    if (!input) {
      alert("No se pudo encontrar el contenido para generar el PDF.");
      return;
    }

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = 10;

      let heightLeft = imgHeight;
      let currentY = position;

      while (heightLeft > 0) {
        if (currentY + heightLeft > pageHeight - 10 && currentY !== 10) {
          pdf.addPage();
          currentY = 10;
        }

        pdf.addImage(
          imgData,
          "PNG",
          10,
          currentY,
          imgWidth,
          Math.min(heightLeft, pageHeight - currentY - 10)
        );

        heightLeft -= pageHeight - currentY - 10;
        currentY = 10;
      }

      pdf.save("reporte_sistema.pdf");
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Error al generar el PDF. Revisa la consola para más detalles.");
    }
  };

  const reportsToDisplay = [
    { periodo: "semanal", data: weeklyReport },
    { periodo: "mensual", data: monthlyReport },
    { periodo: "anual", data: annualReport },
  ];
  const sortedClientReport = clientReport
    ? [...clientReport].sort(
        (a, b) => parseFloat(b.totalGastado) - parseFloat(a.totalGastado)
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Reportes del Sistema
          </h1>
          <button
            onClick={handleDownloadPDF}
            className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center"
            disabled={
              loading ||
              (!weeklyReport &&
                !monthlyReport &&
                !annualReport &&
                clientReport.length === 0)
            }
          >
            Generar Reporte PDF
          </button>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <p className="text-gray-700">Cargando reportes...</p>
        ) : (
          <div
            ref={reportRef}
            className="bg-white p-8 rounded-lg text-gray-900 max-w-7xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {reportsToDisplay.map(({ periodo, data }) => (
                <div
                  key={periodo}
                  className="bg-gray-100 p-6 rounded-2xl shadow-md border border-gray-200"
                >
                  <h2 className="text-xl font-semibold text-gray-900 capitalize mb-4">
                    Reporte {periodo}
                  </h2>
                  {data ? (
                    <>
                      <p className="text-gray-600">
                        Periodo: {data.periodoInicio} - {data.periodoFin}
                      </p>
                      <p className="text-gray-600">
                        Reservaciones: {data.totalReservaciones}
                      </p>
                      <p className="text-gray-600">
                        Clientes únicos: {data.totalClientesUnicos}
                      </p>
                      <p className="text-gray-600 mb-2">
                        Vuelos involucrados: {data.totalVuelosInvolucrados}
                      </p>
                      <p className="text-black font-bold">
                        Total de ventas: $
                        {parseFloat(data.totalVentas).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        USD
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-600">
                      No hay datos para el reporte {periodo}.
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Clientes Registrados y sus Gastos
              </h2>
              {clientReport.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {sortedClientReport.map((cliente) => (
                    <div
                      key={cliente.idCliente}
                      className="bg-gray-100 p-4 rounded-xl shadow hover:shadow-lg transition"
                    >
                      <p className="text-gray-900 font-medium">
                        {cliente.nombreCompleto}
                      </p>
                      <p className="text-gray-600 text-sm">{cliente.email}</p>
                      <p className="text-gray-600 text-sm">
                        Reservaciones: {cliente.cantidadReservaciones}
                      </p>
                      <p className="text-gray-800 font-semibold text-sm mt-1">
                        Total gastado: $
                        {parseFloat(cliente.totalGastado).toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                        )}{" "}
                        USD
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  No hay clientes registrados o datos de reservaciones.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportesPage;
