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
        <title>Bluey · Votaciones</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                background: linear-gradient(145deg, #1b4d6e 0%, #2a6f96 100%);
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: 'Segoe UI', 'Comic Neue', system-ui, sans-serif;
            }
            .container {
                text-align: center;
                animation: fadeIn 1.2s ease-out;
            }
            .bluey-icon {
                font-size: 6rem;
                display: inline-block;
                animation: bounce 2s infinite ease;
                filter: drop-shadow(0 10px 8px rgba(0,0,0,0.2));
                margin-bottom: 1rem;
            }
            .title {
                color: #FFE8C5;
                text-shadow: 4px 4px 0 #C16F2E;
                font-size: 2.5rem;
                letter-spacing: 2px;
                margin-bottom: 0.5rem;
            }
            .sub {
                color: #f9e0a8;
                font-size: 1.2rem;
                background: rgba(0,0,0,0.2);
                display: inline-block;
                padding: 0.5rem 1.2rem;
                border-radius: 60px;
                backdrop-filter: blur(4px);
            }
            .pulse-ring {
                margin-top: 2rem;
                width: 80px;
                height: 80px;
                background: #f4a261;
                border-radius: 50%;
                margin-left: auto;
                margin-right: auto;
                animation: pulse 1.8s infinite;
                box-shadow: 0 0 0 0 #f4a261;
            }
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
            }
            @keyframes pulse {
                0% {
                    transform: scale(0.9);
                    box-shadow: 0 0 0 0 rgba(244,162,97,0.7);
                }
                70% {
                    transform: scale(1);
                    box-shadow: 0 0 0 20px rgba(244,162,97,0);
                }
                100% {
                    transform: scale(0.9);
                    box-shadow: 0 0 0 0 rgba(244,162,97,0);
                }
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            footer {
                position: fixed;
                bottom: 16px;
                width: 100%;
                text-align: center;
                color: #cfe6f0;
                font-size: 0.75rem;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="bluey-icon">🐕‍🦺✨</div>
            <h1 class="title">Bluey Vota</h1>
            <div class="sub">Sistema de votación cifrada</div>
            <div class="pulse-ring"></div>
        </div>
        <footer>🐾 haz tu voto con POST /votos</footer>
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