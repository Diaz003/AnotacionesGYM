let currentDay = "";
const tableBody = document.getElementById('tableBody');
let chart = null;

const ejerciciosPorDia = {
  Piernas: [
    "Press de Piernas", "Extensión de Cuádriceps", "Curl Femoral",
    "Abducción de cadera", "Aducción de cadera"
  ],
  Pecho: [
    "Press de Pecho", "Aperturas", "Press de Hombro",
    "Fondos asistidos", "Fondos de Tríceps"
  ],
  Espalda: [
    "Dominadas asistidas", "Jalón al Pecho", "Remo Sentado",
    "Curl de Bíceps", "Extensión de Espalda"
  ],
  FullBody: [
    "Press de Piernas", "Press de Pecho", "Remo Sentado",
    "Press de Hombro", "Fondos de Tríceps"
  ]
};

function loadData() {
  currentDay = document.getElementById('dia').value;
  tableBody.innerHTML = '';
  if (!currentDay) return alert("Selecciona un día primero 📅");

  let data = JSON.parse(localStorage.getItem(currentDay) || '[]');

  if (data.length === 0 && ejerciciosPorDia[currentDay]) {
    data = ejerciciosPorDia[currentDay].map(nombre => ({
      fecha: new Date().toISOString().split('T')[0],
      ejercicio: nombre,
      peso: 0,
      reps: 0
    }));
    localStorage.setItem(currentDay, JSON.stringify(data));
  }

  data.forEach(entry => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="date" class="fecha" value="${entry.fecha}"></td>
      <td>
        <select class="ejercicio">
          ${ejerciciosPorDia[currentDay].map(ejercicio => 
            `<option value="${ejercicio}" ${ejercicio === entry.ejercicio ? 'selected' : ''}>${ejercicio}</option>`
          ).join('')}
        </select>
      </td>
      <td><input type="number" class="peso" value="${entry.peso}"></td>
      <td><input type="number" class="reps" value="${entry.reps}"></td>
    `;
    tableBody.appendChild(row);
  });
}

function addRow() {
  if (!currentDay) {
    alert("Selecciona un día primero 📅");
    return;
  }
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><input type="date" class="fecha" value="${new Date().toISOString().split('T')[0]}"></td>
    <td>
      <select class="ejercicio">
        ${ejerciciosPorDia[currentDay].map(ejercicio => `<option value="${ejercicio}">${ejercicio}</option>`).join('')}
      </select>
    </td>
    <td><input type="number" class="peso"></td>
    <td><input type="number" class="reps"></td>
  `;
  tableBody.appendChild(row);
}

function saveData() {
  const rows = document.querySelectorAll('#tableBody tr');
  const data = [];
  rows.forEach(row => {
    const fecha = row.querySelector('.fecha').value;
    const ejercicio = row.querySelector('.ejercicio').value;
    const peso = parseFloat(row.querySelector('.peso').value) || 0;
    const reps = parseInt(row.querySelector('.reps').value) || 0;
    data.push({ fecha, ejercicio, peso, reps });
  });
  localStorage.setItem(currentDay, JSON.stringify(data));
  alert("¡Datos guardados correctamente! 💾");
}

function downloadData() {
  const data = localStorage.getItem(currentDay);
  if (!data) return alert("No hay datos que descargar 📄");

  const blob = new Blob([data], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${currentDay}_registro.txt`;
  a.click();
}

function drawGraph() {
    // Cargar datos del día
    const data = JSON.parse(localStorage.getItem(currentDay) || '[]');
    if (!data.length) {
      return alert("No hay datos para graficar 📊");
    }
  
    // 1) Fechas únicas ordenadas
    const fechas = [...new Set(data.map(d => d.fecha))].sort();
  
    // 2) Ejercicios únicos
    const ejercicios = [...new Set(data.map(d => d.ejercicio))];
  
    // 3) Construir datasets
    const datasets = ejercicios.map((ej) => {
      return {
        label: ej,
        data: fechas.map(fecha => {
          // Buscar la entrada de ese ejercicio en esa fecha
          const entry = data.find(d => d.ejercicio === ej && d.fecha === fecha);
          return entry ? entry.peso : null;
        }),
        fill: false,
        tension: 0.2,
        spanGaps: true
      };
    });
  
    // 4) Preparar labels y datasets para Chart.js
    const ctx = document.getElementById('myChart').getContext('2d');
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: fechas,
        datasets: datasets
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        },
        scales: {
          x: {
            title: { display: true, text: 'Fecha' }
          },
          y: {
            title: { display: true, text: 'Peso (kg)' },
            beginAtZero: true
          }
        }
      }
    });
  }
  