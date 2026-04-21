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
    const result = await pool.query('SELECT * FROM "ta7e41e2f119cd9d111c0738f2c71bd336467216b"');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/votos', async (req, res) => {
  const { col1, col2, col3, col4, col5, col6, col7 } = req.body;

  // Validación básica
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
    console.error('ERROR DETALLADO:', error); // ← Esto aparece en los logs de Vercel
    res.status(500).json({ 
      error: 'Error en la base de datos', 
      detalle: error.message,        // ← Ahora verás el mensaje real
      codigo: error.code 
    });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});