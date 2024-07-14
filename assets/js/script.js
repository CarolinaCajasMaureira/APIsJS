const form = document.querySelector("#form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  convertirValor();
  form.reset();
});

const convertirValor = async function () {
  try {
    const valor = Number(document.querySelector("#valor").value);
    const moneda = document.querySelector("#moneda").value;
    if (valor > 0 && moneda !== "sin seleccion") {
      const respuesta = await obtenerDatos(moneda);
      const valorApi = respuesta.serie[0].valor;
      const dias = respuesta.serie.slice(0, 10).reverse().map(d => d.fecha.split("T", 1)[0]);
      const valores = respuesta.serie.slice(0, 10).reverse().map(v => v.valor);

      await resultadoConversion(valor, valorApi);
      await renderizarGrafico(dias, valores, moneda);
    } else {
      alert("Ingrese un valor y seleccione un tipo de moneda.");
    }
  } catch (error) {
    alert("UPS! Hubo un error al obtener los datos. Espere un momento y vuelva a intentar.");
  }
};

async function obtenerDatos(moneda) {
  try {
    const res = await fetch(`https://mindicador.cl/api/${moneda}`);
    if (!res.ok) {
      throw new Error("Error al obtener datos desde la API");
    }
    const datos = await res.json();
    return { serie: datos.serie };
  } catch (error) {
    console.error("Falló la llamada a la API, usando archivo local: ", error);
    const res = await fetch("mindicador.json");
    if (!res.ok) {
      throw new Error("Error al obtener datos desde el archivo local");
    }
    const datosLocales = await res.json();
    return { serie: [datosLocales[moneda]] };
  }
}

async function resultadoConversion(valorUsuario, valorApi) {
  const valorConvertido = valorUsuario / valorApi;
  document.querySelector("#resultado").textContent = `El valor convertido es: ${valorConvertido.toFixed(2)}`;
}

let grafico;
async function renderizarGrafico(dias, valores, moneda) {
  const ctx = document.getElementById("chart");

  if (grafico) {
    grafico.destroy();
  }

  const coloresPuntos = [
    "red", "violet", "purple"
];

  grafico = new Chart(ctx, {
    type: "line",
    data: {
      labels: dias,
      datasets: [
        {
          label: `Valor del ${moneda} en los últimos 10 días`,
          data: valores,
          backgroundColor: "rgba(216, 191, 216, 0.2)",
          borderColor: "rgba(216, 191, 216, 1)",
          pointBackgroundColor: coloresPuntos,
          borderWidth: 3,
          pointRadius: 9,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    },
  });
}
