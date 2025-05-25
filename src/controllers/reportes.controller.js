import Reservacion from "../models/reservacion.model.js";
import Vuelo from "../models/vuelo.model.js";
import User from "../models/user.model.js";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
  isValid,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";

const getReportData = async (startDate, endDate) => {
  if (!isValid(startDate) || !isValid(endDate) || startDate > endDate) {
    throw new Error(
      "Fechas de inicio o fin inválidas. Asegúrate de que sean fechas ISO válidas (YYYY-MM-DD) y que la fecha de inicio sea anterior o igual a la fecha de fin."
    );
  }

  try {
    const totalReservaciones = await Reservacion.countDocuments({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });
    const uniqueClientIds = await Reservacion.distinct("userId", {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });
    const totalClientesUnicos = uniqueClientIds.length;

    const uniqueVueloIds = await Reservacion.distinct("vueloId", {
      createdAt: { $gte: startDate, $lte: endDate },
    });
    const totalVuelosInvolucrados = uniqueVueloIds.length;

    const reservacionesConVuelo = await Reservacion.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).populate("vueloId");

    let totalVentas = 0;
    reservacionesConVuelo.forEach((res) => {
      if (
        res.vueloId &&
        typeof res.vueloId.costo === "number" &&
        typeof res.asientos === "number"
      ) {
        totalVentas += res.asientos * res.vueloId.costo;
      }
    });

    return {
      periodoInicio: format(startDate, "dd MMMM", { locale: es }),
      periodoFin: format(endDate, "dd MMMM", { locale: es }),
      totalReservaciones: totalReservaciones,
      totalClientesUnicos: totalClientesUnicos,
      totalVuelosInvolucrados: totalVuelosInvolucrados,
      totalVentas: totalVentas.toFixed(2),
    };
  } catch (error) {
    console.error("Error en getReportData:", error);
    throw new Error(
      `No se pudieron obtener los datos del reporte: ${error.message}`
    );
  }
};

export const getWeeklyReport = async (req, res) => {
  try {
    const now = new Date();
    const startDate = startOfWeek(now, { weekStartsOn: 1 });
    const endDate = endOfWeek(now, { weekStartsOn: 1 });

    const report = await getReportData(startDate, endDate);
    res.json({
      mensaje: "Reporte semanal generado con éxito",
      reporte: report,
    });
  } catch (error) {
    console.error("Error al generar el reporte semanal:", error);
    res.status(500).json({
      mensaje: "Error interno del servidor al generar el reporte semanal.",
      error: error.message,
    });
  }
};

export const getMonthlyReport = async (req, res) => {
  try {
    const now = new Date();
    const startDate = startOfMonth(now);
    const endDate = endOfMonth(now);

    const report = await getReportData(startDate, endDate);
    res.json({
      mensaje: "Reporte Mensual Generado Exitosamente",
      reporte: report,
    });
  } catch (error) {
    console.error("Error al generar el reporte mensual:", error);
    res.status(500).json({
      mensaje: "Error interno del servidor al generar el reporte mensual.",
      error: error.message,
    });
  }
};

export const getAnnualReport = async (req, res) => {
  try {
    const now = new Date();
    const startDate = startOfYear(now);
    const endDate = endOfYear(now);

    const report = await getReportData(startDate, endDate);
    res.json({
      mensaje: "Reporte Anual Generado Exitosamente",
      reporte: report,
    });
  } catch (error) {
    console.error("Error al generar el reporte anual:", error);
    res.status(500).json({
      mensaje: "Error interno del servidor al generar el reporte anual.",
      error: error.message,
    });
  }
};


export const getClientReservationsReport = async (req, res) => {
  try {
    const clients = await User.find({ rol: "Cliente" }).select(
      "nombre apellido email"
    );

    const clientReports = [];

    for (const client of clients) {
      let totalGastado = 0;

      const reservations = await Reservacion.find({
        userId: client._id,
      }).populate("vueloId");

      for (const res of reservations) {
        if (
          res.vueloId &&
          typeof res.vueloId.costo === "number" &&
          typeof res.asientos === "number"
        ) {
          totalGastado += res.asientos * res.vueloId.costo;
        }
      }

      clientReports.push({
        idCliente: client._id,
        nombreCompleto: `${client.nombre} ${client.apellido}`,
        email: client.email,
        cantidadReservaciones: reservations.length,
        totalGastado: totalGastado.toFixed(2),
      });
    }

    res.json({
      mensaje: "Reporte de Clientes y Reservaciones Generado Exitosamente",
      reporteClientes: clientReports,
    });
  } catch (error) {
    console.error(
      "Error al generar el reporte de clientes y reservaciones:",
      error
    );
    res.status(500).json({
      mensaje:
        "Error interno del servidor al generar el reporte de clientes y reservaciones.",
      error: error.message,
    });
  }
};
