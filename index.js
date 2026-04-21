import pool from './db.js'; 
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bluey - App de Votaciones</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                background: linear-gradient(135deg, #1e3c72 0%, #2b4c82 100%);
                font-family: 'Segoe UI', 'Comic Neue', 'Comic Neue', 'Comic Sans MS', 'Chalkboard SE', cursive, sans-serif;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            .card {
                background-color: #f9e7c2;
                border-radius: 60px 60px 60px 40px;
                box-shadow: 0 20px 35px rgba(0,0,0,0.2);
                max-width: 700px;
                width: 100%;
                padding: 2rem;
                text-align: center;
                border: 5px solid #f4a261;
                position: relative;
                transition: transform 0.2s;
            }
            .card:hover {
                transform: scale(1.02);
            }
            .bluey-header {
                background-color: #1e6091;
                border-radius: 50px;
                padding: 15px;
                margin: -40px auto 20px auto;
                width: fit-content;
                box-shadow: 0 5px 0 #0d3b54;
            }
            .bluey-header h1 {
                color: #f9e7c2;
                font-size: 2.2rem;
                text-shadow: 3px 3px 0 #0d3b54;
                letter-spacing: 2px;
            }
            .paw-icon {
                font-size: 3rem;
                margin: 10px 0;
                display: inline-block;
                animation: wag 1s infinite alternate;
            }
            @keyframes wag {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(15deg); }
            }
            .character {
                display: flex;
                justify-content: center;
                gap: 15px;
                margin: 20px 0;
            }
            .character span {
                font-size: 3.5rem;
                filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.2));
                transition: transform 0.2s;
            }
            .character span:hover {
                transform: translateY(-8px);
            }
            .info {
                background: #e2d5b6;
                border-radius: 35px;
                padding: 20px;
                margin: 25px 0;
                font-size: 1.2rem;
                color: #2d3e50;
                border-left: 10px solid #f4a261;
            }
            .btn-votar {
                background-color: #f4a261;
                border: none;
                color: #1e3c72;
                font-size: 1.5rem;
                font-weight: bold;
                padding: 12px 30px;
                border-radius: 50px;
                cursor: pointer;
                transition: all 0.3s;
                box-shadow: 0 5px 0 #c76e2e;
                font-family: inherit;
                margin-top: 10px;
            }
            .btn-votar:hover {
                background-color: #e76f51;
                transform: translateY(-2px);
                box-shadow: 0 7px 0 #c76e2e;
            }
            footer {
                margin-top: 30px;
                font-size: 0.8rem;
                color: #8b7a5b;
            }
            @media (max-width: 500px) {
                .card { padding: 1.2rem; }
                .bluey-header h1 { font-size: 1.5rem; }
                .character span { font-size: 2.5rem; }
            }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="bluey-header">
                <h1>🐾 BLUEY APP 🐾</h1>
            </div>
            <div class="paw-icon">
                🐕🦴🐾
            </div>
            <div class="character">
                <span>🐕‍🦺 Bluey</span>
                <span>🦴 Bingo</span>
                <span>🐶 Bandit</span>
                <span>🤱 Chilli</span>
            </div>
            <div class="info">
                ✨ ¡Bienvenido a la aventura de votaciones! ✨<br>
                Aquí puedes registrar tus votos como si jugaras con Bluey y su familia.<br>
                <strong>Usa el endpoint POST /votos</strong> para enviar tus datos cifrados.
            </div>
            <button class="btn-votar" onclick="alert('Para votar, envía una petición POST a /votos con formato JSON. Revisa la documentación. 🐕')">
                🗳️ ¡Quiero votar!
            </button>
            <footer>
                Hecho con 💙 y mucha diversión al estilo Bluey.
            </footer>
        </div>
        <script>
            // Un pequeño efecto de sonido imaginario (solo consola)
            console.log('%c🐶 ¡Wacalo! Has entrado al mundo de Bluey', 'color: #f4a261; font-size: 16px;');
        </script>
    </body>
    </html>
  `);
});

app.post('/verificar', async (req, res) => {
  const { votante } = req.body;
  try {
    const result = await pool.query('SELECT * FROM "ta7e41e2f119cd9d111c0738f2c71bd336467216b" WHERE "a89344c9c1c66bb7d5691d88a4b7309499e0324be" = $1', [votante]);
    if (result.rows.length === 0) {
        return res.status(200).json({ mensaje: 'Votante no encontrado puede votar' });
    }
    else {
        return res.status(200).json({ mensaje: 'Votante encontrado, solo se puede votar una sola vez' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/votos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "ta7e41e2f119cd9d111c0738f2c71bd336467216b"');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/votos', async (req, res) => {
  const { col1, col2, col3, col4, col5, col6, col7 } = req.body;

  if (!col1 || !col2 || !col3 || !col4 || !col5 || !col6 || !col7) {
    return res.status(400).json({ 
      error: 'Faltan campos: col1, col2, col3, col4, col5, col6, col7' 
    });
  }

  try {
    const query = `
      INSERT INTO "public"."ta7e41e2f119cd9d111c0738f2c71bd336467216b" (
        "a89344c9c1c66bb7d5691d88a4b7309499e0324be",
        "a90457f37945b8dfb83e1b46c6e7e042e02d91984",
        "a790d32ac3577c9048b63b8e56391bd0d63f9ecf4",
        "a455ee7b3ef6288a901c9bca7593568c9dd36807a",
        "a48a66962617bf51f46a9db9942af639056a5bc17",
        "a79b70b410141467f65c2100cdb656a5cd3b58f53",
        "ab99eb061f4f93aef0d9feaf32f7984afa9dd7c3b"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `;
    const values = [col1, col2, col3, col4, col5, col6, col7];
    const result = await pool.query(query, values);
    res.status(201).json({ message: 'Insertado', id: result.rows[0].id });
  } catch (error) {
    console.error('ERROR DETALLADO:', error); 
    res.status(500).json({ 
      error: 'Error en la base de datos', 
      detalle: error.message,  
      codigo: error.code 
    });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});