import { useRef } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useReportes } from "../context/ReportesContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const GraficasPage = () => {
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

      pdf.save("reporte_graficas.pdf");
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Error al generar el PDF. Revisa la consola para más detalles.");
    }
  };

  const ventasData = {
    labels: ["Semanal", "Mensual", "Anual"],
    datasets: [
      {
        label: "Ventas Totales (USD)",
        data: [
          weeklyReport ? parseFloat(weeklyReport.totalVentas) : 0,
          monthlyReport ? parseFloat(monthlyReport.totalVentas) : 0,
          annualReport ? parseFloat(annualReport.totalVentas) : 0,
        ],
        backgroundColor: "rgba(99, 102, 241, 0.7)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: "Número de Reservaciones",
        data: [
          weeklyReport ? weeklyReport.totalReservaciones : 0,
          monthlyReport ? monthlyReport.totalReservaciones : 0,
          annualReport ? annualReport.totalReservaciones : 0,
        ],
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const sortedClientReportForChart = clientReport
    ? [...clientReport].sort(
        (a, b) => b.cantidadReservaciones - a.cantidadReservaciones
      )
    : [];

  const generateColors = (numColors) => {
    const colors = [
      "rgba(244, 63, 94, 0.7)",
      "rgba(59, 130, 246, 0.7)",
      "rgba(234, 179, 8, 0.7)",
      "rgba(20, 184, 166, 0.7)",
      "rgba(168, 85, 247, 0.7)",
      "rgba(251, 146, 60, 0.7)",
      "rgba(139, 92, 246, 0.7)",
      "rgba(249, 115, 22, 0.7)",
      "rgba(100, 116, 139, 0.7)",
      "rgba(217, 70, 239, 0.7)",
    ];
    return Array.from(
      { length: numColors },
      (_, i) => colors[i % colors.length]
    );
  };

  const clientesData = {
    labels: sortedClientReportForChart.map((cliente) => cliente.nombreCompleto),
    datasets: [
      {
        label: "Reservaciones por Cliente",
        data: sortedClientReportForChart.map(
          (cliente) => cliente.cantidadReservaciones
        ),
        backgroundColor: generateColors(sortedClientReportForChart.length),
        borderColor: generateColors(sortedClientReportForChart.length).map(
          (color) => color.replace("0.7", "1")
        ),
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: function (value, index, values) {
            if (
              this.getLabelForValue(value) &&
              this.getLabelForValue(value).includes("Ventas Totales")
            ) {
              return "$" + value.toLocaleString();
            }
            const datasetIndex = values.findIndex((v) => v.value === value);
            if (datasetIndex === 0) {
              return "$" + value.toLocaleString();
            }
            return value.toLocaleString();
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label.includes("Ventas Totales")) {
              return `${label}: $${context.raw.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`;
            }
            return `${label}: ${context.raw.toLocaleString()}`;
          },
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 12,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage =
              total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} reservas (${percentage}%)`;
          },
        },
      },
    },
  };

  const reportsToDisplay = [
    { periodo: "semanal", data: weeklyReport },
    { periodo: "mensual", data: monthlyReport },
    { periodo: "anual", data: annualReport },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard de Ventas
            </h1>
            <p className="text-gray-600">
              Visualización de métricas y estadísticas
            </p>
          </div>
          <div className="mt-4 md:mt-0">
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
          <p className="text-gray-700">Cargando reportes y gráficas...</p>
        ) : (
          <div
            ref={reportRef}
            className="bg-white p-6 rounded-lg text-gray-900 max-w-7xl mx-auto shadow-md"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {reportsToDisplay.map(({ periodo, data }) => (
                <div
                  key={periodo}
                  className="bg-gray-100 p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                    {periodo}
                  </h3>
                  {data ? (
                    <>
                      <p className="mt-2 text-3xl font-semibold text-gray-900">
                        $
                        {parseFloat(data.totalVentas).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>
                          <p>Reservaciones:</p>
                          <p className="font-medium text-gray-900">
                            {data.totalReservaciones}
                          </p>
                        </div>
                        <div>
                          <p>Clientes:</p>
                          <p className="font-medium text-gray-900">
                            {data.totalClientesUnicos}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-600">
                      No hay datos para el reporte {periodo}.
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Ventas y Reservaciones por Período
                </h2>
                <div className="h-80">
                  <Bar data={ventasData} options={barOptions} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Distribución de Reservaciones por Cliente
                </h2>
                <div className="h-80 flex items-center justify-center">
                  {sortedClientReportForChart.length > 0 ? (
                    <Pie data={clientesData} options={pieOptions} />
                  ) : (
                    <p className="text-gray-600">
                      No hay datos de clientes para mostrar el gráfico.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mt-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Detalle de Clientes (Ordenado por Gasto)
                </h2>
              </div>
              <div className="overflow-x-auto">
                {sortedClientReportForChart.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                        >
                          Cliente
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                        >
                          Reservaciones
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                        >
                          Total Gastado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedClientReportForChart.map((cliente) => (
                        <tr
                          key={cliente.idCliente}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-900 font-medium">
                                  {cliente.nombreCompleto.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {cliente.nombreCompleto}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {cliente.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {cliente.cantidadReservaciones}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              $
                              {parseFloat(cliente.totalGastado).toLocaleString(
                                "en-US",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="p-6 text-gray-600">
                    No hay clientes con reservaciones para mostrar.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraficasPage;
