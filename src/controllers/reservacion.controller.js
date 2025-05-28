import mongoose from "mongoose";
import Reservacion from "../models/reservacion.model.js";
import Vuelo from "../models/vuelo.model.js"; // Necesitas el modelo Vuelo para las reglas de equipaje
import PDFDocument from "pdfkit"; // Para generar PDFs
import qrcode from "qrcode"; // Para generar códigos QR en el pase de abordar
import fs from "fs"; // Para guardar el PDF temporalmente o stream
import path from "path"; // Para manejar rutas de archivos
import { fileURLToPath } from "url"; // Para __dirname en módulos ES6

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const _createReservationLogic = async (vueloId, userId, asientos) => {
  if (!userId) {
    throw new Error("No user ID provided. User must be authenticated.");
  }
  if (!mongoose.Types.ObjectId.isValid(vueloId)) {
    throw new Error("ID de vuelo inválido");
  }
  // Convertir a número entero y validar. Usamos Number() para asegurar el tipo.
  const numAsientos = Number(asientos);
  if (
    !numAsientos || // Verifica que no sea 0, NaN, null, undefined
    typeof numAsientos !== "number" ||
    numAsientos < 1 ||
    !Number.isInteger(numAsientos)
  ) {
    throw new Error(
      "Número de asientos inválido. Debe ser un número entero positivo."
    );
  }

  // --- BUSCA EL VUELO Y DECREMENTA ASIENTOS ---
  // Aquí es donde corregiremos el "quitar un lugar extra"
  // El $inc decrementa exactamente la cantidad de 'asientos'.
  // Si te quita uno extra, asegúrate que 'asientos' tenga el valor correcto (ej. 1, 2, 3...)
  const vueloActualizado = await vueloModel.findOneAndUpdate(
    {
      _id: vueloId,
      asientosDisponibles: { $gte: numAsientos }, // Asegura que haya suficientes asientos
    },
    {
      $inc: { asientosDisponibles: -numAsientos }, // Decrementa exactamente 'numAsientos'
    },
    { new: true } // Devuelve el documento actualizado
  );

  if (!vueloActualizado) {
    // Si findOneAndUpdate no encontró un vuelo que cumpliera las condiciones
    // (o no había suficientes asientos)
    const vueloExiste = await vueloModel
      .findById(vueloId)
      .select("_id asientosDisponibles");

    if (!vueloExiste) {
      throw new Error("Vuelo no encontrado");
    } else {
      throw new Error(
        `No hay suficientes asientos disponibles en este vuelo. Asientos disponibles: ${vueloExiste.asientosDisponibles}. Intentaste reservar: ${numAsientos}.`
      );
    }
  }

  const nuevaReservacion = new Reservacion({
    userId: userId,
    vueloId: vueloId,
    asientos: asientos,
    estado: "confirmada", // Asumimos que esta lógica solo se llama para reservas confirmadas
    fechaReservacion: new Date(),
  });

  const reservacionGuardada = await nuevaReservacion.save();
  return reservacionGuardada;
};

export const createReservacion = async (req, res) => {
  try {
    const { vueloId } = req.params;
    const { asientos } = req.body; // Esto debería ser el número de asientos deseado
    const userId = req.user?.id;

    // Llama a la lógica central de reserva
    const reservacionGuardada = await _createReservationLogic(
      vueloId,
      userId,
      asientos
    );

    res.status(201).json({
      message: "Reservación creada exitosamente",
      reservacion: reservacionGuardada,
    });
  } catch (error) {
    console.error("Error al crear la reservación:", error.message);
    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "Error al crear la reservación: Datos duplicados (esto no debería ocurrir si no hay restricciones únicas en la combinación userId+vueloId, pero puede ser por stripeSessionId si el webhook se reintenta y no se maneja bien).",
      });
    }
    // Para errores de validación lanzados por _createReservationLogic
    if (
      error.message.includes("ID de vuelo inválido") ||
      error.message.includes("Número de asientos inválido") ||
      error.message.includes("No user ID provided") ||
      error.message.includes("Vuelo no encontrado") ||
      error.message.includes("No hay suficientes asientos disponibles")
    ) {
      return res.status(400).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: "Error interno del servidor al crear la reservación" });
  }
};

export const getReservaciones = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "No tienes permiso para ver reservaciones. Inicia sesión.",
      });
    }

    const reservaciones = await Reservacion.find({ userId: userId })
      .populate("vueloId")
      .populate("userId");

    res.status(200).json(reservaciones);
  } catch (error) {
    console.error("Error al obtener las reservaciones:", error);
    res.status(500).json({
      message: "Error interno del servidor al obtener las reservaciones",
    });
  }
};

export const cancelReservacion = async (req, res) => {
  try {
    const { reservacionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message:
          "No tienes permiso para cancelar reservaciones. Inicia sesión.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(reservacionId)) {
      return res.status(400).json({ message: "ID de reservación inválido" });
    }

    const reservacionEliminada = await Reservacion.findOneAndDelete({
      _id: reservacionId,
      userId: userId,
    });

    if (!reservacionEliminada) {
      return res.status(404).json({
        message:
          "Reservación no encontrada o no tienes permiso para cancelarla.",
      });
    }

    const vueloActualizado = await vueloModel.findByIdAndUpdate(
      reservacionEliminada.vueloId,
      { $inc: { asientosDisponibles: reservacionEliminada.asientos } },
      { new: true }
    );

    if (!vueloActualizado) {
      console.warn(
        `Advertencia: Reservación ${reservacionId} cancelada para el usuario ${userId}, pero falló la actualización de asientos para el vuelo ${reservacionEliminada.vueloId}.`
      );
    }

    res.status(200).json({
      message: "Reservación cancelada exitosamente",
      reservacion: reservacionEliminada,
    });
  } catch (error) {
    console.error("Error al cancelar la reservación:", error);
    res.status(500).json({
      message: "Error interno del servidor al cancelar la reservación",
    });
  }
};

export const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    const reservacion = await Reservacion.findById(id)
      .populate("vueloId") // <-- ¡CAMBIO AQUÍ!
      .populate("userId"); // <-- ¡CAMBIO AQUÍ!
    if (!reservacion) {
      return res.status(404).json({ message: "Reservación no encontrada." });
    }
    res.json(reservacion);
  } catch (error) {
    console.error("Error en getReservationById del controlador:", error);
    return res.status(500).json({
      message: "Error al obtener la reservación por ID: " + error.message,
    });
  }
};

export const getReservacionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const reservacion = await Reservacion.findById(id)
      .populate("vueloId")
      .populate("userId");

    if (!reservacion) {
      return res.status(404).json({ message: "Reservación no encontrada." });
    }
    res.status(200).json(reservacion);
  } catch (error) {
    console.error("Error al obtener estado de reservación:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const checkInReservacion = async (req, res) => {
  try {
    const { id } = req.params; // ID de la reservación
    const { pasajerosACheckIn } = req.body; // Array de objetos { pasajeroIndex, equipajeFacturado }

    const reservacion = await Reservacion.findById(id).populate("vueloId");
    if (!reservacion) {
      return res.status(404).json({ message: "Reservación no encontrada." });
    }
    if (!reservacion.vueloId) {
      return res
        .status(400)
        .json({
          message:
            "No se encontró información del vuelo para esta reservación.",
        });
    }

    let totalCargosEquipajeReservacion =
      reservacion.cargosAdicionalesEquipaje || 0; // Acumulador de cargos

    for (const pCheckIn of pasajerosACheckIn) {
      const { pasajeroIndex, equipajeFacturado } = pCheckIn;

      if (
        pasajeroIndex === undefined ||
        pasajeroIndex < 0 ||
        pasajeroIndex >= reservacion.pasajeros.length
      ) {
        return res
          .status(400)
          .json({ message: `Índice de pasajero inválido: ${pasajeroIndex}` });
      }

      const pasajero = reservacion.pasajeros[pasajeroIndex];

      if (pasajero.checkedIn) {
        console.log(
          `Pasajero ${pasajero.nombre} ${pasajero.apellido} ya ha hecho check-in.`
        );
        continue; // Saltar si ya hizo check-in
      }

      let cargoPasajeroActual = 0;
      let maletasFacturadasCount = 0;
      pasajero.equipajeFacturado = []; // Resetear para el check-in actual

      // --- Lógica para restricciones de peso y cargos por equipaje adicional ---
      const reglas = reservacion.vueloId.reglasEquipaje;

      for (let i = 0; i < equipajeFacturado.length; i++) {
        const bag = equipajeFacturado[i];
        let cargoMaleta = 0;

        // Validación básica del peso
        if (bag.pesoKg < 0) {
          return res
            .status(400)
            .json({
              message: `El peso de la maleta ${i + 1} para ${
                pasajero.nombre
              } no puede ser negativo.`,
            });
        }

        // Cargo por maleta adicional (si excede las gratuitas)
        if (maletasFacturadasCount >= reglas.equipajeFacturadoGratis) {
          cargoMaleta += reglas.cargoMaletaAdicional;
        }

        // Cargo por exceso de peso
        if (bag.pesoKg > reglas.pesoMaxFacturadoKgPorMaleta) {
          const excesoPeso = bag.pesoKg - reglas.pesoMaxFacturadoKgPorMaleta;
          cargoMaleta += excesoPeso * reglas.cargoExcesoPesoKg;
        }

        pasajero.equipajeFacturado.push({
          pesoKg: bag.pesoKg,
          tagId: `BAG-${reservacion._id
            .toString()
            .substring(0, 4)}-${pasajeroIndex}-${i + 1}-${Date.now()
            .toString()
            .slice(-4)}`, // Generar un ID de etiqueta simple
          cargoAplicado: cargoMaleta,
        });
        cargoPasajeroActual += cargoMaleta;
        maletasFacturadasCount++;
      }

      pasajero.checkedIn = true;
      pasajero.checkInTime = new Date();
      totalCargosEquipajeReservacion += cargoPasajeroActual; // Sumar al total de la reserva

      // --- Generar Pase de Abordar ---
      const boardingPassId = `BP-${reservacion._id
        .toString()
        .substring(0, 6)}-${pasajeroIndex}-${Date.now().toString().slice(-6)}`;
      const boardingPassFilePath = path.join(
        __dirname,
        "..",
        "public",
        "boarding_passes",
        `${boardingPassId}.pdf`
      ); // Guarda en public/boarding_passes

      // Asegúrate de que la carpeta exista
      const publicDir = path.join(__dirname, "..", "public", "boarding_passes");
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      const boardingPassUrl = `/public/boarding_passes/${boardingPassId}.pdf`; // URL accesible desde el frontend

      pasajero.boardingPassId = boardingPassId;
      pasajero.boardingPassUrl = boardingPassUrl;

      await generateBoardingPassPDF(
        pasajero,
        reservacion.vueloId,
        reservacion,
        boardingPassFilePath
      );
      console.log(
        `Pase de abordar generado para ${pasajero.nombre} ${pasajero.apellido}`
      );
    }

    reservacion.cargosAdicionalesEquipaje = totalCargosEquipajeReservacion;

    // Actualizar el estado global de la reservación
    const allCheckedIn = reservacion.pasajeros.every((p) => p.checkedIn);
    const anyCheckedIn = reservacion.pasajeros.some((p) => p.checkedIn);

    if (allCheckedIn) {
      reservacion.estadoReservacion = "Check-in Completo";
    } else if (anyCheckedIn) {
      reservacion.estadoReservacion = "Check-in Parcial";
    } else {
      reservacion.estadoReservacion = "Check-in Pendiente";
    }

    await reservacion.save();
    res
      .status(200)
      .json({ message: "Check-in completado exitosamente.", reservacion });
  } catch (error) {
    console.error("Error en el proceso de check-in:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor durante el check-in." });
  }
};

// --- Función para generar el PDF del Pase de Abordar (Helper) ---
async function generateBoardingPassPDF(pasajero, vuelo, reservacion, filePath) {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Generar QR Code
    const qrCodeData = `BOARDING_PASS_ID:${pasajero.boardingPassId}\nRESERVATION_ID:${reservacion._id}\nFLIGHT_ID:${vuelo._id}`;
    let qrCodeImage = "";
    try {
      qrCodeImage = await qrcode.toDataURL(qrCodeData, { width: 100 });
    } catch (err) {
      console.error("Error generando QR code:", err);
      // Continúa sin QR si hay error
    }

    // Diseño del Pase de Abordar
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("PASE DE ABORDAR", { align: "center" });
    doc
      .fontSize(10)
      .text(
        "------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------",
        { align: "center" }
      )
      .moveDown(0.5);

    doc
      .fontSize(16)
      .text(`${vuelo.origen} → ${vuelo.destino}`, { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Vuelo: ${vuelo.aerolinea} ${vuelo.numeroVuelo || "N/A"}`, {
        align: "center",
      })
      .moveDown(0.2);
    doc
      .text(
        `Fecha: ${new Date(vuelo.fechaSalida).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        { align: "center" }
      )
      .moveDown(1);

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(`Pasajero: ${pasajero.nombre} ${pasajero.apellido}`, {
        align: "left",
      })
      .moveDown(0.2);
    doc
      .font("Helvetica")
      .text(`Asiento: ${pasajero.asientoAsignado || "PENDIENTE"}`, {
        align: "left",
      });
    doc
      .text(
        `Identificación: ${pasajero.tipoDocumento} ${pasajero.numeroDocumento}`,
        { align: "left" }
      )
      .moveDown(1);

    // Detalles del vuelo
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Detalles del Vuelo:", { align: "left" })
      .moveDown(0.2);
    doc
      .font("Helvetica")
      .text(
        `Salida: ${new Date(vuelo.fechaSalida).toLocaleDateString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${vuelo.origen}`,
        { align: "left" }
      );
    doc.text(
      `Llegada: ${new Date(vuelo.fechaLlegada).toLocaleDateString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${vuelo.destino}`,
      { align: "left" }
    );
    doc.text(
      `Abordaje: ${new Date(
        vuelo.fechaSalida.getTime() - 45 * 60 * 1000
      ).toLocaleTimeString("es-ES")} (45 min antes de salida)`,
      { align: "left" }
    ); // Ejemplo: 45 min antes
    doc.text(`Puerta: ${vuelo.puertaEmbarque || "Por anunciar"}`, {
      align: "left",
    }); // Asegúrate de tener campo puertaEmbarque en tu vuelo model
    doc.text(`Avión: ${vuelo.avion}`, { align: "left" }).moveDown(1);

    // Detalles del equipaje
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Equipaje Facturado:", { align: "left" })
      .moveDown(0.2);
    if (pasajero.equipajeFacturado && pasajero.equipajeFacturado.length > 0) {
      pasajero.equipajeFacturado.forEach((bag, index) => {
        doc
          .font("Helvetica")
          .text(
            `Maleta ${index + 1}: ${bag.pesoKg} kg (ID: ${
              bag.tagId
            }) - Cargo: $${bag.cargoAplicado.toFixed(2)} MXN`,
            { align: "left" }
          );
      });
    } else {
      doc.font("Helvetica").text("No se facturó equipaje.", { align: "left" });
    }
    doc
      .text(
        `Equipaje de Mano: ${vuelo.reglasEquipaje.equipajeManoKg} kg permitido`,
        { align: "left" }
      )
      .moveDown(1);

    // QR Code
    if (qrCodeImage) {
      doc.image(qrCodeImage, doc.x + 200, doc.y - 150, { width: 100 }); // Posición relativa
    }

    doc
      .fontSize(10)
      .text(
        "------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------",
        { align: "center" }
      )
      .moveDown(0.5);
    doc.text(`ID de Pase de Abordar: ${pasajero.boardingPassId}`, {
      align: "center",
    });
    doc.text(
      `Check-in realizado el: ${pasajero.checkInTime.toLocaleString("es-ES")}`,
      { align: "center" }
    );

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}
