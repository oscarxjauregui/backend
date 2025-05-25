// src/context/ReportesContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import {
  getWeeklyReportRequest,
  getMonthlyReportRequest,
  getAnnualReportRequest,
  getClientReservationsReportRequest,
} from "../api/reportes";

const ReportesContext = createContext();

export const useReportes = () => {
  const context = useContext(ReportesContext);
  if (!context) {
    throw new Error("useReportes debe ser usado dentro de un ReportesProvider");
  }
  return context;
};

export const ReportesProvider = ({ children }) => {
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [annualReport, setAnnualReport] = useState(null);
  const [clientReport, setClientReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resWeekly, resMonthly, resAnnual, resClients] =
        await Promise.allSettled([
          getWeeklyReportRequest(),
          getMonthlyReportRequest(),
          getAnnualReportRequest(),
          getClientReservationsReportRequest(),
        ]);

      if (resWeekly.status === "fulfilled" && resWeekly.value.data.reporte) {
        setWeeklyReport(resWeekly.value.data.reporte);
      } else {
        console.error("Error fetching weekly report:", resWeekly.reason);
        setWeeklyReport(null);
      }

      if (resMonthly.status === "fulfilled" && resMonthly.value.data.reporte) {
        setMonthlyReport(resMonthly.value.data.reporte);
      } else {
        console.error("Error fetching monthly report:", resMonthly.reason);
        setMonthlyReport(null);
      }

      if (resAnnual.status === "fulfilled" && resAnnual.value.data.reporte) {
        setAnnualReport(resAnnual.value.data.reporte);
      } else {
        console.error("Error fetching annual report:", resAnnual.reason);
        setAnnualReport(null);
      }

      if (
        resClients.status === "fulfilled" &&
        Array.isArray(resClients.value.data.reporteClientes)
      ) {
        setClientReport(resClients.value.data.reporteClientes);
      } else {
        console.error("Error fetching client report:", resClients.reason);
        setClientReport([]);
      }
    } catch (err) {
      console.error("Error general al cargar los reportes:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al cargar los reportes.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReports();
  }, []);

  return (
    <ReportesContext.Provider
      value={{
        weeklyReport,
        monthlyReport,
        annualReport,
        clientReport,
        loading,
        error,
        fetchAllReports,
      }}
    >
      {children}
    </ReportesContext.Provider>
  );
};
