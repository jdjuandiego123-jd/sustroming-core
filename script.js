// CONFIGURACIÓN AVANZADA DEL TABLERO MARINO (8x8 = 64 BLOQUES)
const FILAS = 8;
const COLUMNAS = 8;
const TOTAL_BLOQUES = FILAS * COLUMNAS;
const NUM_TIBURONES = 10; // Cantidad total de peligros ocultos

let matrizTiburones = [];
let bloquesRevelados = 0;
let puntos = 0;
let juegoTerminado = false;

// 1. FUNCIÓN MATRIZ: GENERAR TABLERO 8x8
function crearTableroPro() {
    const tablero = document.getElementById('tableroPro');
    if (!tablero) return;
    
    tablero.innerHTML = '';
    juegoTerminado = false;
    bloquesRevelados = 0;
    
    document.getElementById('marcadorPuntos').innerText = `PUNTOS: ${puntos}`;
    const estado = document.getElementById('estadoJuego');
    estado.innerText = "ESTADO: JUGANDO";
    estado.style.color = "#d161ff";
    estado.style.textShadow = "0 0 12px #bc13fe, 0 0 20px #bc13fe";

    // Ubicar los 10 tiburones aleatoriamente en el mapa
    matrizTiburones = new Array(TOTAL_BLOQUES).fill(false);
    let tiburonesColocados = 0;
    while (tiburonesColocados < NUM_TIBURONES) {
        let randIndex = Math.floor(Math.random() * TOTAL_BLOQUES);
        if (!matrizTiburones[randIndex]) {
            matrizTiburones[randIndex] = true;
            tiburonesColocados++;
        }
    }

    // Crear las 64 celdas del tablero
    for (let i = 0; i < TOTAL_BLOQUES; i++) {
        const bloque = document.createElement('div');
        bloque.classList.add('bloque-pro');
        bloque.dataset.index = i;
        bloque.onclick = () => revelarCelda(bloque, i);
        tablero.appendChild(bloque);
    }
}

// 2. FUNCIÓN DE REVELADO Y LÓGICA DE PROXIMIDAD
function revelarCelda(elemento, index) {
    if (juegoTerminado || elemento.classList.contains('seguro') || elemento.classList.contains('lava')) return;

    const estado = document.getElementById('estadoJuego');

    // Caso A: Chocar contra un Tiburón
    if (matrizTiburones[index]) {
        elemento.classList.add('lava');
        elemento.innerText = '🦈';
        estado.innerText = "¡UN TIBURÓN TE ATRAPÓ!";
        estado.style.color = "#ff3344";
        estado.style.textShadow = "0 0 12px #ff3344, 0 0 20px #ff3344";
        juegoTerminado = true;
        revelarTodoElMar();
    } 
    // Caso B: Zona segura (Calcular proximidad)
    else {
        elemento.classList.add('seguro');
        bloquesRevelados++;
        
        let conteoPeligro = contarTiburonesCercanos(index);
        elemento.innerText = conteoPeligro > 0 ? conteoPeligro : '🐠';
        
        puntos += 10;
        document.getElementById('marcadorPuntos').innerText = `PUNTOS: ${puntos}`;

        // Evaluar condición de victoria
        if (bloquesRevelados === (TOTAL_BLOQUES - NUM_TIBURONES)) {
            estado.innerText = "¡COMPLETO! MAR ASEGURADO";
            estado.style.color = "#00ffaa";
            estado.style.textShadow = "0 0 12px #00ffaa";
            juegoTerminado = true;
        }
    }
}

// 3. CÁLCULO DE COORDENADAS VECINAS EN MATRIZ
function contarTiburonesCercanos(index) {
    let cuenta = 0;
    let r = Math.floor(index / COLUMNAS);
    let c = index % COLUMNAS;

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            let nuevaFila = r + i;
            let nuevaCol = c + j;
            if (nuevaFila >= 0 && nuevaFila < FILAS && nuevaCol >= 0 && nuevaCol < COLUMNAS) {
                let indexVecino = nuevaFila * COLUMNAS + nuevaCol;
                if (matrizTiburones[indexVecino]) {
                    cuenta++;
                }
            }
        }
    }
    return cuenta;
}

// 4. MUESTRA EL MAPA DE MINAS AL PERDER
function revelarTodoElMar() {
    const bloques = document.querySelectorAll('.bloque-pro');
    bloques.forEach((b, idx) => {
        if (matrizTiburones[idx]) {
            b.classList.add('lava');
            b.innerText = '🦈';
        }
    });
}

function reiniciarJuegoPro() {
    puntos = 0;
    crearTableroPro();
}

// 5. BANDEJA DE PROPUESTAS EN TIEMPO REAL
// 5. BANDEJA DE PROPUESTAS CON ALMACENAMIENTO PERMANENTE (LOCALSTORAGE)
function agregarSugerenciaEnVivo() {
    const nombre = document.getElementById('inputNombre').value.trim() || "Anónimo";
    const texto = document.getElementById('inputTexto').value.trim();
    const cajaBandeja = document.getElementById('cajaBandeja');

    if (!texto) {
        alert("Por favor, escribe una sugerencia antes de enviar.");
        return;
    }

    const nuevaSugerencia = { nombre, texto };

    let listaSugerencias = JSON.parse(localStorage.getItem('sugerenciasSustroming')) || [];
    listaSugerencias.push(nuevaSugerencia);

    localStorage.setItem('sugerenciasSustroming', JSON.stringify(listaSugerencias));

    cargarSugerenciasGuardadas();

    document.getElementById('inputTexto').value = '';
    alert("¡Sugerencia guardada permanentemente en el buzón!");
}

// FUNCIÓN PARA PINTAR LAS SUGERENCIAS GUARDADAS AL RECARGAR
function cargarSugerenciasGuardadas() {
    const cajaBandeja = document.getElementById('cajaBandeja');
    if (!cajaBandeja) return;

    let listaSugerencias = JSON.parse(localStorage.getItem('sugerenciasSustroming')) || [];

    if (listaSugerencias.length === 0) {
        cajaBandeja.innerHTML = `<div class="item-sugerencia" style="color: #6080b0; text-align: center; border-bottom: none; padding: 10px 0;">El buzón está vacío. ¡Envía la primera propuesta!</div>`;
        return;
    }

    cajaBandeja.innerHTML = ''; 

    listaSugerencias.forEach(sug => {
        const nuevaFila = document.createElement('div');
        nuevaFila.style.borderBottom = "1px dashed #0055ff";
        nuevaFila.style.padding = "10px 0";
        nuevaFila.style.fontSize = "1.3rem";
        nuevaFila.innerHTML = `<strong style="color:#00ffff; text-shadow: 0 0 5px #0055ff;">🐟 ${sug.nombre}:</strong> <span style="color:#ffffff;">${sug.texto}</span>`;
        cajaBandeja.appendChild(nuevaFila);
    });

    cajaBandeja.scrollTop = cajaBandeja.scrollHeight;
}

window.onload = function() {
    crearTableroPro();
    cargarSugerenciasGuardadas(); 
};



