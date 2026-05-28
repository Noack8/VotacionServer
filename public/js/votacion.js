// votacion.js - Lógica de cifrado, mezcla, renderizado y eventos

import { verificarSupervisor, verificarVotante, registrarVoto } from './api.js';

// === Configuración AES-128-CBC ===
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

// === MEZCLAR FIRMA Y NOMBRE ===
function mezclarFirmaYNombre(firmaCompleta, nombre, numChars = 10) {
    if (!nombre || nombre.trim() === "") return firmaCompleta.slice(-numChars);
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
    { nombre: "Presidente", candidatos: [
        { id: "pres1", nombre: "Juan Pérez", imagen: "/imagenes/JuanPerez.jpg" },
        { id: "pres2", nombre: "María López", imagen: "/imagenes/MariaLopez.jpg" },
        { id: "pres3", nombre: "Carlos Ruiz", imagen: "/imagenes/CarlosRuiz.jpg" }
    ] },
    { nombre: "Alcalde", candidatos: [
        { id: "alc1", nombre: "Ana Gómez", imagen: "/imagenes/AnaGomez.jpg" },
        { id: "alc2", nombre: "Luis Fernández", imagen: "/imagenes/LuisFernandez.jpg" },
        { id: "alc3", nombre: "Sofía Martínez", imagen: "/imagenes/SofiaMartinez.jpg" }
    ] },
    { nombre: "Diputado", candidatos: [
        { id: "dip1", nombre: "Pedro Rojas", imagen: "/imagenes/PedroRojas.jpg" },
        { id: "dip2", nombre: "Laura Silva", imagen: "/imagenes/LauraSilva.jpg" },
        { id: "dip3", nombre: "Diego Castro", imagen: "/imagenes/DiegoCastro.jpg" }
    ] }
];

// Variables de estado
let identificadorHashGlobal = "";
let selecciones = {};
let nombresSeleccionados = {};
let urnaActual = null;
let supervisorActual = null;

// Elementos DOM [Dynamic Object Model]
const loginSection = document.getElementById("loginSection");
const votingAppSection = document.getElementById("votingAppSection");
const supervisorInfo = document.getElementById("supervisorInfo");
const loginResultDiv = document.getElementById("loginResult");
const resultArea = document.getElementById("resultArea");
const boletaInput = document.getElementById("boletaInput");
const step1Div = document.getElementById("step1");
const step2Div = document.getElementById("step2");
const urnaDisplay = document.getElementById("urnaDisplay");
const votingContainer = document.getElementById("votingContainer");
const enviarBtn = document.getElementById("enviarBtn");
const finalizarBtn = document.getElementById("finalizarBtn");

function mostrarResultado(mensaje, tipo = 'success') {
    resultArea.innerHTML = mensaje;
    resultArea.classList.add("show", tipo);
    resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function ocultarResultado() {
    resultArea.classList.remove("show", "success", "error");
    resultArea.innerHTML = "";
}

function renderVotingUI() {
    votingContainer.innerHTML = "";
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
        votingContainer.appendChild(sectionDiv);
    });
}

// === LOGIN ===
document.getElementById("loginRealBtn").addEventListener("click", async () => {
    const username = document.getElementById("usuarioInput").value.trim();
    const password = document.getElementById("passwordInput").value.trim();
    if (!username || !password) {
        loginResultDiv.innerHTML = "❌ Completa ambos campos.";
        loginResultDiv.classList.add("show", "error");
        return;
    }
    const hashUsername = CryptoJS.SHA1(username).toString();
    const hashPassword = CryptoJS.SHA1(password).toString();

    const btn = document.getElementById("loginRealBtn");
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span> Verificando...';
    btn.disabled = true;

    try {
        const { ok, mensaje, error } = await verificarSupervisor(hashUsername, hashPassword);
        if (ok) {
            supervisorActual = username;
            loginSection.classList.add("hidden");
            votingAppSection.classList.remove("hidden");
            supervisorInfo.innerHTML = `👤 Supervisor activo: <strong>${escapeHtml(username)}</strong>`;
            ocultarResultado();
            loginResultDiv.classList.remove("show");
            step1Div.classList.remove("hidden");
            step2Div.classList.add("hidden");
            boletaInput.value = "";
            identificadorHashGlobal = "";
            selecciones = {};
            nombresSeleccionados = {};
            urnaActual = null;
        } else {
            loginResultDiv.innerHTML = `❌ ${mensaje || "Acceso denegado"}`;
            loginResultDiv.classList.add("show", "error");
        }
    } catch (err) {
        loginResultDiv.innerHTML = `❌ Error de conexión: ${err.message}`;
        loginResultDiv.classList.add("show", "error");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

// === VERIFICAR VOTANTE ===
enviarBtn.addEventListener("click", async () => {
    ocultarResultado();
    const boletaPlana = boletaInput.value.trim();
    if (!boletaPlana) {
        mostrarResultado("❌ Por favor ingresa una boleta.", "error");
        return;
    }
    const textoConstante = " Sistema de votaciones 2026";
    const concatenado = boletaPlana + textoConstante;
    const hashSha256 = CryptoJS.SHA256(concatenado).toString();
    identificadorHashGlobal = hashSha256;

    const originalText = enviarBtn.innerHTML;
    enviarBtn.innerHTML = '<span class="spinner"></span> Verificando hash...';
    enviarBtn.disabled = true;

    try {
        const { ok, mensaje, error } = await verificarVotante(identificadorHashGlobal);
        if (ok) {
            if (mensaje === "Votante no encontrado puede votar") {
                urnaActual = Math.floor(Math.random() * 3) + 1;
                urnaDisplay.innerHTML = `🗳️ Urna asignada: <strong>${urnaActual}</strong>`;
                step1Div.classList.add("hidden");
                step2Div.classList.remove("hidden");
                renderVotingUI();
                mostrarResultado("✅ Boleta válida. Selecciona tus candidatos.", "success");
            } else if (mensaje === "Votante encontrado, solo se puede votar una sola vez") {
                mostrarResultado("❌ Este votante ya ha emitido su voto.", "error");
            } else {
                mostrarResultado("⚠️ Respuesta inesperada.", "error");
            }
        } else {
            mostrarResultado(`❌ Error del servidor: ${error || "Desconocido"}`, "error");
        }
    } catch (err) {
        mostrarResultado(`❌ Error de conexión: ${err.message}`, "error");
    } finally {
        enviarBtn.innerHTML = originalText;
        enviarBtn.disabled = false;
    }
});

// === REGISTRAR VOTO  ===
finalizarBtn.addEventListener("click", async () => {
    if (!urnaActual) urnaActual = Math.floor(Math.random() * 3) + 1;

    // Trazabilidad (Chain1 incluye al supervisor)
    const cadenaUsuario = `${identificadorHashGlobal} ${supervisorActual}`;
    const Chain1 = CryptoJS.SHA256(cadenaUsuario).toString();
    const cadenaParaHash = `${Chain1} urna ${urnaActual}`;
    const Chain2 = CryptoJS.SHA256(cadenaParaHash).toString();
    const bd = Math.floor(Math.random() * 3) + 1; // 1,2,3 aleatorio
    const cadenaBaseDatos = `${Chain2} BD ${bd}`;
    const Chain3 = CryptoJS.SHA256(cadenaBaseDatos).toString();

    const nombrePresidente = nombresSeleccionados[0] ?? null;
    const nombreAlcalde = nombresSeleccionados[1] ?? null;
    const nombreDiputado = nombresSeleccionados[2] ?? null;

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

    const originalText = finalizarBtn.innerHTML;
    finalizarBtn.innerHTML = '<span class="spinner"></span> Registrando voto...';
    finalizarBtn.disabled = true;

    try {
        const { ok, message, error } = await registrarVoto(payload, bd);
        if (ok) {
            //mostrarResultado(`✅ ¡Voto registrado exitosamente en la BD ${bd}!`, "success");
            mostrarResultado(`✅ ¡Voto registrado exitosamente! `, "success");
            setTimeout(() => {
                step2Div.classList.add("hidden");
                step1Div.classList.remove("hidden");
                boletaInput.value = "";
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
        finalizarBtn.innerHTML = originalText;
        finalizarBtn.disabled = false;
    }
});

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => (m === '&' ? '&amp;' : (m === '<' ? '&lt;' : '&gt;')));
}