// api.js
export async function verificarVotante(votanteHash) {
    const response = await fetch('/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ votante: votanteHash })
    });
    const data = await response.json();
    return { ok: response.ok, mensaje: data.mensaje, error: data.error };
}

export async function registrarVoto(payload) {
    const response = await fetch('/registrar-voto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await response.json();
    return { ok: response.ok, message: data.message, error: data.error };
}