/* eslint-disable no-undef */
import {
  gameData
} from './questions.js';

const paises = gameData.countries;
console.log(paises);

const totalPaises = 5;

const juego = document.body.children[1].firstElementChild;

const zonaCiudades = juego.children[1];

const zonaPaises = juego.children[2];

//Templates
const temps = document.getElementsByTagName("template");
const tempCiudad = temps[0];
const tempPais = temps[1];

const btnEmpezar = juego.children[0].firstElementChild;
btnEmpezar.addEventListener('click', (e) => {
  cargarPaises(e)
});

const tiempo = juego.children[0].children[1].firstElementChild;

let chrono;
let marker;

/**
 * Carga nuevos países y ciudad, empieza de nuevo el juego.
 * @param {object} Evento 
 */
function cargarPaises(e) {
  borrarNodosHijos(zonaCiudades);
  borrarNodosHijos(zonaPaises);
  let paisesSeleccionados = [];
  while (paisesSeleccionados.length < totalPaises) {
    let random = nRandom(paises.length);
    let paisCode = paises[random].code;
    let existe = paisesSeleccionados.find(pais => pais.code === paisCode);
    if (typeof existe === 'undefined') {
      paisesSeleccionados.push(paises[random]);
    }
  }
  //Crear nodos
  let ciudadesNodos = [];
  let paisesNodos = [];
  paisesSeleccionados.forEach(pais => {
    let random = nRandom(pais.cities.length);
    //----CIUDAD----
    ciudadesNodos.push(crearNodoTemplate(tempCiudad, pais.code, pais.cities[random].name));
    //----PAIS----  
    paisesNodos.push(crearNodoTemplate(tempPais, pais.code, pais.name));
  });

  //Barajar ciudades
  ciudadesNodos = barajarArray(ciudadesNodos);
  paisesNodos = barajarArray(paisesNodos);

  //Imprimir
  for (let i = 0; i < paisesNodos.length; i++) {
    zonaCiudades.appendChild(ciudadesNodos[i]);
    zonaPaises.appendChild(paisesNodos[i]);
  }
  e.target.disabled = true;

  //Chrono
  chrono = setInterval(startCronometro, 1000);
  tiempo.textContent = 0;

  cargarFunciones();
}

/**
 * Comprueba si todos los países están correctos.
 */
function comprobarCorrectos() {
  let selector = document.getElementsByClassName('correcto').length;
  let terminado = false;
  if (selector === totalPaises) {
    terminado = true;
  }
  return terminado;
}

/**
 * Crea nodos a partir de un template.
 * @param {string} Template elegido 
 * @param {number} Código del país
 * @param {string} Título del elemento 
 */
function crearNodoTemplate(template, codigo, titulo) {
  let fragmento = template.content.cloneNode(true);
  let agrupador = fragmento.firstElementChild;
  agrupador.dataset.code = codigo;
  agrupador.firstElementChild.textContent = titulo;
  return agrupador;
}

/**
 * Inicia el cronometro, empezando en 0.
 */
function startCronometro() {
  let segundos = tiempo.textContent;
  segundos++;
  tiempo.textContent = segundos;
}

/**
 * Elemento padre a borrar.
 * @param {string} padre 
 */
function borrarNodosHijos(padre) {
  while (padre.firstChild) {
    padre.removeChild(padre.firstChild);
  }
}

/**
 * Función que devuelve un número random.
 * @param {number} max 
 */
function nRandom(max) {
  let n = Math.floor(Math.random() * max);
  return n;
}

/**
 * Función que le hace un shuffle a un array.
 * @param {array} array 
 */
function barajarArray(array) {
  array = array.sort(() => Math.random() - 0.5);
  return array;
}

/**
 * Busca las coordenadas del país y ciudad seleccionada.
 * @param {number} paisCode 
 * @param {string} nombreCiudad 
 */
function buscarCoordenadas(paisCode, nombreCiudad) {
  let pais = paises.find(pais => pais.code === paisCode);
  let ciudad = pais.cities.find(ciudad => ciudad.name === nombreCiudad);
  return ciudad.location;
}

//* JUEGO
/**
 * Carga las funciones Jquery necesarias.
 */
function cargarFunciones() {
  $(".draggable").draggable({
    containment: "#juego",
    revert: true
  });
  $(".droppable").droppable({
    drop: function (event, ui) {
      let codeCiudad = ui.draggable[0].dataset.code;
      let codePais = event.target.parentNode.dataset.code;
      if (codeCiudad === codePais) {
        $(this).addClass("correcto");
        $(ui.draggable[0]).draggable("option", "revert", false);
        $(ui.draggable[0]).draggable("disable");
        //MAPA
        let nombreCiudad = ui.draggable[0].firstElementChild.textContent;
        let coords = buscarCoordenadas(codePais, nombreCiudad);
        mapa.flyTo(coords, 9.7, {
          animate: true,
          duration: 1.5
        });
        if (marker != null) {
          mapa.removeLayer(marker);
        }
        marker = new L.Marker(coords);
        mapa.addLayer(marker);
        marker.bindPopup(`<b>${nombreCiudad}</b>`).openPopup();
        // let nombrePais = paises.find(pais => pais.code === codePais);
        // cargarDatosPie([nombreCiudad])
        if (comprobarCorrectos()) {
          btnEmpezar.disabled = false;
          clearInterval(chrono);
          partidas++;
          cargarDatos([partidas, parseInt(tiempo.textContent)]);
        }
      }
    }
  });
}
//* MAPA

let mapa = L.map('mapa').setView([28.456066827338073, -16.283267254812316], 18);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia3ZnbSIsImEiOiJja2s1YXRmYWQwOTJsMnZvMDAyOGltZTl0In0.Zz25osGiW9WV1TK4k31rBA', {
  maxZoom: 18,
  id: 'mapbox/streets-v11',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'your.mapbox.access.token'
}).addTo(mapa);
marker = L.marker([28.456066827338073, -16.283267254812316]).addTo(mapa);
marker.bindPopup(`<b>CIFP César Manrique</b>`).openPopup();

//* GRAFICOS

let chart;
let data;
let options;
let partidas = 0;

google.charts.load('current', {
  packages: ['corechart', 'line']
});
google.charts.setOnLoadCallback(crearChartLineal);

/**
 * Crea el chart lineal.
 */

function crearChartLineal() {
  data = new google.visualization.DataTable();
  data.addColumn('number', 'X');
  data.addColumn('number', 'Tiempos');
  options = {
    hAxis: {
      title: 'Intentos'
    },
    vAxis: {
      title: 'Tiempo'
    },
    title: 'Tiempo por partida'
  };
  chart = new google.visualization.LineChart(document.getElementsByClassName('chartLine')[0]);
  chart.draw(data, options);
}

/**
 * Manda los datos al chart lineal.
 * @param {array} datos 
 */
function cargarDatos(datos) {
  data.addRows([datos]);
  chart.draw(data, options);
}

// google.charts.load('current', {
//   'packages': ['corechart']
// });
// google.charts.setOnLoadCallback(drawChartPie);

// let dataPie;
// let optionsPie;
// let chartPie;

// function drawChartPie() {
//   dataPie = google.visualization.arrayToDataTable([0, 0]);
//   optionsPie = {
//     title: 'Ocurrencias Países'
//   };
//   chartPie = new google.visualization.PieChart(document.getElementsByClassName('chartCircle')[0]);
//   chartPie.draw(dataPie, optionsPie);
// }

// function cargarDatosPie(datos) {
//   dataPie = google.visualization.arrayToDataTable([datos]);
//   chartPie.draw(dataPie, optionsPie);
// }