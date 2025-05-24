import { useState, useEffect, useRef } from "react";
import { useNomina } from "../context/NominaContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const NominaPage = () => {
  const { nominaPilotos, nominaAzafatas, loading, error, fetchNomina } =
    useNomina();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const pilotosTableRef = useRef(null);
  const azafatasTableRef = useRef(null);

  useEffect(() => {
    fetchNomina(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const meses = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString("es-ES", { month: "long" }),
  }));

  const years = Array.from({ length: 7 }, (_, i) => currentYear - 5 + i);

  const generatePdfReport = async () => {
    const doc = new jsPDF("p", "mm", "a4");

    const monthName =
      meses.find((m) => m.value === selectedMonth)?.label || selectedMonth;
    const reportTitle = `Reporte de Nómina - ${monthName} ${selectedYear}`;

    doc.setFontSize(18);
    doc.text(reportTitle, 14, 22);

    if (pilotosTableRef.current) {
      doc.setFontSize(14);
      doc.text("Nómina de Pilotos", 14, 40);

      try {
        console.log("Capturing pilotos table with html2canvas...");
        const canvas = await html2canvas(pilotosTableRef.current, {
          scale: 2,
          useCORS: true,
          logging: true,
          backgroundColor: "#ffffff",
        });
        console.log("Pilotos table captured to canvas.");
        const imgData = canvas.toDataURL("image/png");
        console.log("Image data generated for pilotos table.");

        const imgWidth = 190;
        const pageHeight = doc.internal.pageSize.height;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 50;

        if (imgHeight > pageHeight - position - 10) {
          let pageNum = 1;
          while (heightLeft > 0) {
            if (pageNum > 1) {
              doc.addPage();
              position = 10;
            }
            doc.addImage(
              imgData,
              "PNG",
              10,
              position,
              imgWidth,
              Math.min(heightLeft, pageHeight - position - 10),
              undefined,
              "FAST"
            );
            heightLeft -= pageHeight - position - 10;
            position = 10;
            pageNum++;
          }
        } else {
          doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        }

        doc.lastElementFinalY = position + imgHeight + 10;
      } catch (error) {
        console.error("Error capturing pilotos table:", error);
        alert(
          "Error al capturar la tabla de pilotos para el PDF. Consulte la consola para más detalles."
        );
      }
    }

    if (azafatasTableRef.current) {
      let azafatasStartY = 0;
      if (doc.lastElementFinalY) {
        azafatasStartY = doc.lastElementFinalY + 20;
      } else {
        azafatasStartY = doc.internal.pageSize.height / 2;
      }

      doc.setFontSize(14);
      doc.text("Nómina de Azafatas", 14, azafatasStartY);

      try {
        console.log("Capturing azafatas table with html2canvas...");
        const canvas = await html2canvas(azafatasTableRef.current, {
          scale: 2,
          useCORS: true,
          logging: true,
          backgroundColor: "#ffffff",
        });
        console.log("Azafatas table captured to canvas.");
        const imgData = canvas.toDataURL("image/png");
        console.log("Image data generated for azafatas table.");

        const imgWidth = 190;
        const pageHeight = doc.internal.pageSize.height;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = azafatasStartY + 5;

        if (imgHeight > pageHeight - position - 10) {
          let pageNum = 1;
          while (heightLeft > 0) {
            if (pageNum > 1 || position + heightLeft > pageHeight - 10) {
              doc.addPage();
              position = 10;
            }
            doc.addImage(
              imgData,
              "PNG",
              10,
              position,
              imgWidth,
              Math.min(heightLeft, pageHeight - position - 10),
              undefined,
              "FAST"
            );
            heightLeft -= pageHeight - position - 10;
            position = 10;
            pageNum++;
          }
        } else {
          doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        }
      } catch (error) {
        console.error("Error capturing azafatas table:", error);
        alert(
          "Error al capturar la tabla de azafatas para el PDF. Consulte la consola para más detalles."
        );
      }
    }

    doc.save(`Nomina_Reporte_${monthName}_${selectedYear}.pdf`);
    console.log("PDF generated and saved.");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Administración de Nómina
        </h1>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center">
          <div>
            <label
              htmlFor="month-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Seleccionar Mes
            </label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900"
            >
              {meses.map((mes) => (
                <option key={mes.value} value={mes.value}>
                  {mes.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="year-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Seleccionar Año
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:ml-auto mt-4 sm:mt-0">
            <button
              onClick={generatePdfReport}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md"
              disabled={
                loading ||
                (nominaPilotos.length === 0 && nominaAzafatas.length === 0)
              }
            >
              Generar Reporte PDF
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-700">Cargando nómina...</p>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Nómina de Pilotos
            </h2>
            {nominaPilotos.length > 0 ? (
              <div
                ref={pilotosTableRef}
                className="overflow-x-auto shadow-md sm:rounded-lg"
              >
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Nombre Completo
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-right">
                        Sueldo Base (USD)
                      </th>
                      <th scope="col" className="px-6 py-3 text-right">
                        Bono Vuelos (USD)
                      </th>
                      <th scope="col" className="px-6 py-3 text-right">
                        Bono Copiloto (USD)
                      </th>
                      <th scope="col" className="px-6 py-3 text-right">
                        Sueldo Total (USD)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {nominaPilotos.map((piloto) => (
                      <tr
                        key={piloto._id}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          {piloto.nombreCompleto}
                        </td>
                        <td className="px-6 py-4">{piloto.email}</td>
                        <td className="px-6 py-4 text-right">
                          ${piloto.sueldoBase.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          ${piloto.bonoPorVuelos.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          ${piloto.bonoPorCopiloto.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 font-bold text-green-600 text-right">
                          ${piloto.sueldoTotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">
                No hay datos de nómina para pilotos para el mes seleccionado.
              </p>
            )}

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Nómina de Azafatas
            </h2>
            {nominaAzafatas.length > 0 ? (
              <div
                ref={azafatasTableRef}
                className="overflow-x-auto shadow-md sm:rounded-lg"
              >
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Nombre Completo
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-right">
                        Sueldo Base (USD)
                      </th>
                      <th scope="col" className="px-6 py-3 text-right">
                        Vuelos Finalizados
                      </th>
                      <th scope="col" className="px-6 py-3 text-right">
                        Bono Vuelos (USD)
                      </th>
                      <th scope="col" className="px-6 py-3 text-right">
                        Sueldo Total (USD)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {nominaAzafatas.map((azafata) => (
                      <tr
                        key={azafata._id}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          {azafata.nombreCompleto}
                        </td>
                        <td className="px-6 py-4">{azafata.email}</td>
                        <td className="px-6 py-4 text-right">
                          ${azafata.sueldoBase.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {azafata.vuelosFinalizadosMes}
                        </td>
                        <td className="px-6 py-4 text-right">
                          ${azafata.bonoPorVuelos.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 font-bold text-green-600 text-right">
                          ${azafata.sueldoTotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">
                No hay datos de nómina para azafatas para el mes seleccionado.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NominaPage;
