// votacion.js
import { verificarVotante, registrarVoto } from './api.js';

// --- Configuración de cifrado AES-128-CBC ---
const SECRET_KEY = "9QtBteWKKZaNFD2S";
const INIT_VECTOR = "mAQZptX9oOGIkQHS";
const keyWordArray = CryptoJS.enc.Utf8.parse(SECRET_KEY);
const ivWordArray = CryptoJS.enc.Utf8.parse(INIT_VECTOR);

function encryptAES128(plaintext) {
    if (plaintext === null || plaintext === undefined) return null;
    const encrypted = CryptoJS.AES.encrypt(plaintext, keyWordArray, {
        iv: ivWordArray,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}

// Función para intercalar últimos 10 caracteres de la firma con el nombre (sin espacios)
function mezclarFirmaYNombre(firmaCompleta, nombre, numChars = 10) {
    if (!nombre || nombre.trim() === "") {
        return firmaCompleta.slice(-numChars);
    }
    const nombreLimpio = nombre.replace(/\s/g, '');
    const parteFirma = firmaCompleta.slice(-numChars);
    let resultado = "";
    const maxLen = Math.max(parteFirma.length, nombreLimpio.length);
    for (let i = 0; i < maxLen; i++) {
        if (i < parteFirma.length) resultado += parteFirma[i];
        if (i < nombreLimpio.length) resultado += nombreLimpio[i];
    }
    return resultado;
}

// Lista de candidatos
const secciones = [
    {
        nombre: "Presidente",
        candidatos: [
            { id: "pres1", nombre: "Juan Pérez", imagen: "/imagenes/JuanPerez.jpg" },
            { id: "pres2", nombre: "María López", imagen: "/imagenes/MariaLopez.jpg" },
            { id: "pres3", nombre: "Carlos Ruiz", imagen: "/imagenes/CarlosRuiz.jpg" }
        ]
    },
    {
        nombre: "Alcalde",
        candidatos: [
            { id: "alc1", nombre: "Ana Gómez", imagen: "/imagenes/AnaGomez.jpg" },
            { id: "alc2", nombre: "Luis Fernández", imagen: "/imagenes/LuisFernandez.jpg" },
            { id: "alc3", nombre: "Sofía Martínez", imagen: "/imagenes/SofiaMartinez.jpg" }
        ]
    },
    {
        nombre: "Diputado",
        candidatos: [
            { id: "dip1", nombre: "Pedro Rojas", imagen: "/imagenes/PedroRojas.jpg" },
            { id: "dip2", nombre: "Laura Silva", imagen: "/imagenes/LauraSilva.jpg" },
            { id: "dip3", nombre: "Diego Castro", imagen: "/imagenes/DiegoCastro.jpg" }
        ]
    }
];

// Variables globales del módulo
let identificadorHashGlobal = "";
let selecciones = {};
let nombresSeleccionados = {};
let urnaActual = null;

// Función para mostrar mensajes al usuario
function mostrarResultado(mensaje, tipo = 'success') {
    const resultArea = document.getElementById("resultArea");
    resultArea.innerHTML = mensaje;
    resultArea.classList.add("show", tipo);
    resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function ocultarResultado() {
    const resultArea = document.getElementById("resultArea");
    resultArea.classList.remove("show", "success", "error");
    resultArea.innerHTML = "";
}

// Renderizar la interfaz de votación
function renderVotingUI() {
    const container = document.getElementById("votingContainer");
    container.innerHTML = "";
    selecciones = {};
    nombresSeleccionados = {};

    secciones.forEach((seccion, idx) => {
        const sectionDiv = document.createElement("div");
        sectionDiv.className = "voting-section";
        sectionDiv.innerHTML = `<div class="section-title">${seccion.nombre}</div>`;
        const candidatesDiv = document.createElement("div");
        candidatesDiv.className = "candidates";
        
        seccion.candidatos.forEach(cand => {
            const card = document.createElement("div");
            card.className = "candidate-card";
            card.dataset.seccion = idx;
            card.dataset.candidatoId = cand.id;
            card.dataset.candidatoNombre = cand.nombre;
            card.innerHTML = `
                <img src="${cand.imagen}" alt="${cand.nombre}" onerror="this.src='https://via.placeholder.com/100'">
                <div class="candidate-name">${cand.nombre}</div>
            `;
            card.addEventListener("click", () => {
                if (card.classList.contains("selected")) {
                    card.classList.remove("selected");
                    selecciones[idx] = null;
                    nombresSeleccionados[idx] = null;
                } else {
                    document.querySelectorAll(`.candidate-card[data-seccion='${idx}']`).forEach(c => c.classList.remove("selected"));
                    card.classList.add("selected");
                    selecciones[idx] = cand.id;
                    nombresSeleccionados[idx] = cand.nombre;
                }
            });
            candidatesDiv.appendChild(card);
        });
        sectionDiv.appendChild(candidatesDiv);
        container.appendChild(sectionDiv);
    });
}

// --- Eventos al cargar la página ---
document.addEventListener('DOMContentLoaded', () => {
    const btnEnviar = document.getElementById("enviarBtn");
    const btnFinalizar = document.getElementById("finalizarBtn");

    // Verificar boleta
    btnEnviar.addEventListener("click", async () => {
        ocultarResultado();
        const boletaPlana = document.getElementById("boletaInput").value.trim();

        if (!boletaPlana) {
            mostrarResultado("❌ Por favor ingresa una boleta.", "error");
            return;
        }

        const textoConstante = " Sistema de votaciones 2026";
        const concatenado = boletaPlana + textoConstante;
        const hashSha256 = CryptoJS.SHA256(concatenado).toString();
        identificadorHashGlobal = hashSha256;

        const btn = document.getElementById("enviarBtn");
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="spinner"></span> Verificando hash...';
        btn.disabled = true;

        try {
            const { ok, mensaje, error } = await verificarVotante(identificadorHashGlobal);
            if (ok) {
                if (mensaje === "Votante no encontrado puede votar") {
                    urnaActual = Math.floor(Math.random() * 3) + 1;
                    document.getElementById("urnaDisplay").innerHTML = `🎲 Urna asignada: <strong>${urnaActual}</strong>`;
                    document.getElementById("step1").classList.add("hidden");
                    document.getElementById("step2").classList.remove("hidden");
                    renderVotingUI();
                    mostrarResultado("✅ Boleta válida. Selecciona tus candidatos (puedes dejar campos vacíos).", "success");
                } else if (mensaje === "Votante encontrado, solo se puede votar una sola vez") {
                    mostrarResultado("❌ Este votante ya ha emitido su voto. No se puede votar nuevamente.", "error");
                } else {
                    mostrarResultado("⚠️ Respuesta inesperada del servidor.", "error");
                }
            } else {
                mostrarResultado(`❌ Error del servidor: ${error || "Desconocido"}`, "error");
            }
        } catch (err) {
            mostrarResultado(`❌ Error de conexión: ${err.message}`, "error");
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });

    // Finalizar votación (envío real)
    btnFinalizar.addEventListener("click", async () => {
        if (!urnaActual) urnaActual = Math.floor(Math.random() * 3) + 1;

        // Trazabilidad
        const cadenaUsuario = `${identificadorHashGlobal} Noack`;
        const Chain1 = CryptoJS.SHA256(cadenaUsuario).toString();
        const cadenaParaHash = `${Chain1} urna ${urnaActual}`;
        const Chain2 = CryptoJS.SHA256(cadenaParaHash).toString();
        const bd = Math.floor(Math.random() * 3) + 1;
        const cadenaBaseDatos = `${Chain2} BD ${bd}`;
        const Chain3 = CryptoJS.SHA256(cadenaBaseDatos).toString();

        // Votos mezclados
        const nombrePresidente = nombresSeleccionados[0] !== undefined ? nombresSeleccionados[0] : null;
        const nombreAlcalde = nombresSeleccionados[1] !== undefined ? nombresSeleccionados[1] : null;
        const nombreDiputado = nombresSeleccionados[2] !== undefined ? nombresSeleccionados[2] : null;

        const mixedPresidente = mezclarFirmaYNombre(identificadorHashGlobal, nombrePresidente, 10);
        const mixedAlcalde = mezclarFirmaYNombre(identificadorHashGlobal, nombreAlcalde, 10);
        const mixedDiputado = mezclarFirmaYNombre(identificadorHashGlobal, nombreDiputado, 10);

        const col2 = encryptAES128(mixedPresidente);
        const col3 = encryptAES128(mixedAlcalde);
        const col4 = encryptAES128(mixedDiputado);

        const payload = {
            col1: identificadorHashGlobal,
            col2, col3, col4,
            col5: Chain1,
            col6: Chain2,
            col7: Chain3
        };

        const btn = document.getElementById("finalizarBtn");
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="spinner"></span> Registrando voto...';
        btn.disabled = true;

        try {
            const { ok, message, error } = await registrarVoto(payload);
            if (ok) {
                mostrarResultado("✅ ¡Voto registrado exitosamente! Gracias por participar.", "success");
                setTimeout(() => {
                    document.getElementById("step2").classList.add("hidden");
                    document.getElementById("step1").classList.remove("hidden");
                    document.getElementById("boletaInput").value = "";
                    identificadorHashGlobal = "";
                    selecciones = {};
                    nombresSeleccionados = {};
                    urnaActual = null;
                    ocultarResultado();
                }, 3000);
            } else {
                mostrarResultado(`❌ Error al registrar voto: ${error || "Intente más tarde"}`, "error");
            }
        } catch (err) {
            mostrarResultado(`❌ Error de conexión: ${err.message}`, "error");
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
});