import User from "../models/user.model.js";
import Vuelo from "../models/vuelo.model.js";

const SUELDO_BASE_PILOTO = 5000;
const SUELDO_BASE_AZAFATA = 3000;
const BONO_VUELO_FINALIZADO_PILOTO = 2000;
const BONO_VUELO_FINALIZADO_AZAFATA = 1000;
const BONO_COPILOTO = 1500;

export const calcularNominaPilotos = async (req, res) => {
  const { mes, anio } = req.body;

  if (!mes || !anio) {
    return res.status(400).json({
      message: "Se requieren el mes y el año para calcular la nómina.",
    });
  }

  try {
    const pilotos = await User.find({ rol: "Piloto" });

    if (pilotos.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron pilotos en la base de datos." });
    }

    const nominaPilotos = [];

    const fechaInicioMes = new Date(anio, mes - 1, 1);
    const fechaFinMes = new Date(anio, mes, 0);

    for (const piloto of pilotos) {
      let totalVuelosFinalizados = 0;
      let bonosCopiloto = 0;

      const vuelosDelMes = await Vuelo.find({
        $or: [{ piloto: piloto._id }, { copiloto: piloto._id }],
        estado: "Finalizado",
        fechaLlegada: {
          $gte: fechaInicioMes,
          $lte: fechaFinMes,
        },
      });

      for (const vuelo of vuelosDelMes) {
        if (vuelo.piloto.toString() === piloto._id.toString()) {
          totalVuelosFinalizados++;
        }
        if (
          vuelo.copiloto &&
          vuelo.copiloto.toString() === piloto._id.toString()
        ) {
          bonosCopiloto += BONO_COPILOTO;
        }
      }

      const bonoVuelos = totalVuelosFinalizados * BONO_VUELO_FINALIZADO_PILOTO;

      const sueldoTotal = SUELDO_BASE_PILOTO + bonoVuelos + bonosCopiloto;

      nominaPilotos.push({
        _id: piloto._id,
        nombreCompleto: `${piloto.nombre} ${piloto.apellido}`,
        email: piloto.email,
        rol: piloto.rol,
        sueldoBase: SUELDO_BASE_PILOTO,
        vuelosFinalizadosMes: totalVuelosFinalizados,
        bonoPorVuelos: bonoVuelos,
        bonoPorCopiloto: bonosCopiloto,
        sueldoTotal: sueldoTotal,
      });
    }

    return res.status(200).json(nominaPilotos);
  } catch (error) {
    console.error("Error al calcular la nómina de pilotos:", error);
    return res.status(500).json({
      message: "Error interno del servidor al calcular la nómina de pilotos.",
    });
  }
};

export const calcularNominaAzafatas = async (req, res) => {
  const { mes, anio } = req.body;

  if (!mes || !anio) {
    return res.status(400).json({
      message: "Se requieren el mes y el año para calcular la nómina.",
    });
  }

  try {
    const azafatas = await User.find({ rol: "Azafata" });

    if (azafatas.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron azafatas en la base de datos." });
    }

    const nominaAzafatas = [];

    const fechaInicioMes = new Date(anio, mes - 1, 1);
    const fechaFinMes = new Date(anio, mes, 0);

    for (const azafata of azafatas) {
      let totalVuelosFinalizados = 0;

      const vuelosDelMes = await Vuelo.find({
        $or: [
          { azafata1: azafata._id },
          { azafata2: azafata._id },
          { azafata3: azafata._id },
        ],
        estado: "Finalizado",
        fechaLlegada: {
          $gte: fechaInicioMes,
          $lte: fechaFinMes,
        },
      });

      totalVuelosFinalizados = vuelosDelMes.length;

      const bonoVuelos = totalVuelosFinalizados * BONO_VUELO_FINALIZADO_AZAFATA;

      const sueldoTotal = SUELDO_BASE_AZAFATA + bonoVuelos;

      nominaAzafatas.push({
        _id: azafata._id,
        nombreCompleto: `${azafata.nombre} ${azafata.apellido}`,
        email: azafata.email,
        rol: azafata.rol,
        sueldoBase: SUELDO_BASE_AZAFATA,
        vuelosFinalizadosMes: totalVuelosFinalizados,
        bonoPorVuelos: bonoVuelos,
        sueldoTotal: sueldoTotal,
      });
    }

    return res.status(200).json(nominaAzafatas);
  } catch (error) {
    console.error("Error al calcular la nómina de azafatas:", error);
    return res.status(500).json({
      message: "Error interno del servidor al calcular la nómina de azafatas.",
    });
  }
};
