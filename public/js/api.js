// api.js - Funciones para comunicación con el servidor

export async function verificarSupervisor(usernameHash, passwordHash) {
    const response = await fetch('/verificarS', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameHash, password: passwordHash })
    });
    const data = await response.json();
    return { ok: response.ok, mensaje: data.mensaje, error: data.error };
}

export async function verificarVotante(votanteHash) {
    const response = await fetch('/verificarV', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ votante: votanteHash })
    });
    const data = await response.json();
    return { ok: response.ok, mensaje: data.mensaje, error: data.error };
}

// Registra el voto en una de las tres tablas según el número de BD (1,2,3)
export async function registrarVoto(payload, bdNumber) {
    let endpoint = '';
    if (bdNumber === 1) endpoint = '/registrarV1';
    else if (bdNumber === 2) endpoint = '/registrarV2';
    else endpoint = '/registrarV3';
    
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await response.json();
    return { ok: response.ok, message: data.message, error: data.error };
}