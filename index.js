import pool from './db.js'; 
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('¡Hola Mundo desde Vercel!');
});

// Endpoint de ejemplo para obtener datos
app.get('/users', async (req, res) => {
  const client = await pool.connect(); // Obtiene un cliente del pool
  try {
    const result = await client.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al consultar la base de datos');
  } finally {
    client.release(); // ¡IMPORTANTE! Devuelve el cliente al pool
  }
});

app.get('/votos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "A7E41E2F119CD9D111C0738F2C71BD336467216B"');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/votos', async (req, res) => {
  const { col1, col2, col3, col4, col5, col6, col7 } = req.body;

  // Validar que existan los 7 campos
  if (!col1 || !col2 || !col3 || !col4 || !col5 || !col6 || !col7) {
    return res.status(400).json({ 
      error: 'Faltan campos. Se requiere: col1, col2, col3, col4, col5, col6, col7' 
    });
  }

  try {
    const query = `
      INSERT INTO "A7E41E2F119CD9D111C0738F2C71BD336467216B" (
        "89344C9C1C66BB7D5691D88A4B7309499E0324BE",
        "90457F37945B8DFB83E1B46C6E7E042E02D91984",
        "790D32AC3577C9048B63B8E56391BD0D63F9ECF4",
        "455EE7B3EF6288A901C9BCA7593568C9DD36807A",
        "48A66962617BF51F46A9DB9942AF639056A5BC17",
        "79B70B410141467F65C2100CDB656A5CD3B58F53",
        "B99EB061F4F93AEF0D9FEAF32F7984AFA9DD7C3B"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `;

    const values = [col1, col2, col3, col4, col5, col6, col7];
    const result = await pool.query(query, values);

    res.status(201).json({
      message: 'Voto insertado correctamente',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Error al insertar:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});