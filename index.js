import pool from './db.js'; 
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static('public'));
const path = require('path');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//Verifica si el supervisor e encuentra en la BD con el nombre de usuario y contraseña, si el supervisor se encuentra en la BD, entonces se le permite ingresar al sistema, si el supervisor no se encuentra en la BD, entonces se le dice que no se encuentra registrado y no se le permite ingresar al sistema.
app.post('/verificarS', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM "tf053213d914b6b87715eb8aaad72a3a7ded38c81" WHERE "a3f2ecdef3c6c3b614e34115a95b25944cfa4198a" = $1 AND "a8be3c943b1609fffbfc51aad666d0a04adf83c9d" = $2', [username, password]);
    if (result.rows.length === 0) {
        return res.status(401).json({ mensaje: 'Supervisor no encontrado, acceso denegado' });
    }
    else {
        return res.status(200).json({ mensaje: 'Supervisor encontrado, acceso permitido' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Verifica si es que el votante ya voto o no, se hace con el hash del votante, si el hash no esta registrado en la tabla de votos, entonces se le permite votar, si el hash ya esta registrado, entonces se le dice que ya voto y no se le permite votar de nuevo.
app.post('/verificarV', async (req, res) => {
  const { votante } = req.body;
  try {
    const result = await pool.query('SELECT * FROM "t89344c9c1c66bb7d5691d88a4b7309499e0324be" WHERE "a439145df693732a7d4567e33720a90124508ecdb" = $1', [votante]);
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

/*app.get('/votos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "ta7e41e2f119cd9d111c0738f2c71bd336467216b"');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});*/

// Se insertan los valores en dos tablas distintas, 
  // la primera tabla es para la firma del votante y su trayectoria
  // se hace con un blockchain simple cada columna es un HASH de que 
  // ruta hizo el votante para realizar su tramite
  // la segunda tabla es para registrar el voto en si, 
  // con los datos del voto solamente, esta informacion si va cifrada
  // con un cifrado simetrico AES-256-CBC.

app.post('/registrarV1', async (req, res) => {
  const { col1, col2, col3, col4, col5, col6, col7 } = req.body;
    if (!col1 || !col2 || !col3 || !col4 || !col5 || !col6 || !col7) {
    return res.status(400).json({ 
      error: 'Faltan campos: col1, col2, col3, col4, col5, col6, col7' 
    });
  } 

    // Se insertan los valores de los votos en la BD
    try {
        const query1 = `
        INSERT INTO "public"."t355583f8873bb5bdb4a48696e87537ab3d71b0c0" (
            "abdddf16a7792ac32403646df48c9b277a7c3184e",
            "ab0e43bad48a8c66eb040ff061f8e16f7b095ed7a",
            "a13aef377cbf540b6dfa13b7078754a017a31bf09"
            ) VALUES ($1, $2, $3)
        `;
        const values1 = [col2, col3, col4];
        const result1 = await pool.query(query1, values1);

    // Se inserta el blockchain del votante y su trayetoria en la BD
        const query2 = `
        INSERT INTO "public"."t89344c9c1c66bb7d5691d88a4b7309499e0324be" (
            "a439145df693732a7d4567e33720a90124508ecdb",
            "a48a66962617bf51f46a9db9942af639056a5bc17",
            "a79b70b410141467f65c2100cdb656a5cd3b58f53",
            "ab99eb061f4f93aef0d9feaf32f7984afa9dd7c3b"
        ) VALUES ($1, $2, $3, $4)
        `;
        const values2 = [col1, col5, col6, col7];
        const result2 = await pool.query(query2, values2);
        
        res.status(201).json({ message: 'Voto registrado exitosamente' });
    } catch (error) {
        console.error('ERROR DETALLADO:', error); 
        return res.status(500).json({
            error: 'Error en la base de datos',
            detalle: error.message,
            codigo: error.code
        });
    }
});

app.post('/registrarV2', async (req, res) => {
  const { col1, col2, col3, col4, col5, col6, col7 } = req.body;
    if (!col1 || !col2 || !col3 || !col4 || !col5 || !col6 || !col7) {
    return res.status(400).json({ 
      error: 'Faltan campos: col1, col2, col3, col4, col5, col6, col7' 
    });
  } 

    // Se insertan los valores de los votos en la BD
    try {
        const query1 = `
        INSERT INTO "public"."t9a9760062ebbbe4f6956ed94fc49850f90a214ce" (
            "ab9e7a687d4e3aed26d1982400e88538063686486",
            "a94d15aa69ecb37d70b39f1f6fbb5a10568cc0cdc",
            "a9952f9b71875a553bf7a05fcfed40565937b5db4"
            ) VALUES ($1, $2, $3)
        `;
        const values1 = [col2, col3, col4];
        const result1 = await pool.query(query1, values1);

    // Se inserta el blockchain del votante y su trayetoria en la BD
        const query2 = `
        INSERT INTO "public"."t89344c9c1c66bb7d5691d88a4b7309499e0324be" (
            "a439145df693732a7d4567e33720a90124508ecdb",
            "a48a66962617bf51f46a9db9942af639056a5bc17",
            "a79b70b410141467f65c2100cdb656a5cd3b58f53",
            "ab99eb061f4f93aef0d9feaf32f7984afa9dd7c3b"
        ) VALUES ($1, $2, $3, $4)
        `;
        const values2 = [col1, col5, col6, col7];
        const result2 = await pool.query(query2, values2);
        
        res.status(201).json({ message: 'Voto registrado exitosamente' });
    } catch (error) {
        console.error('ERROR DETALLADO:', error); 
        return res.status(500).json({
            error: 'Error en la base de datos',
            detalle: error.message,
            codigo: error.code
        });
    }
});

app.post('/registrarV3', async (req, res) => {
  const { col1, col2, col3, col4, col5, col6, col7 } = req.body;
    if (!col1 || !col2 || !col3 || !col4 || !col5 || !col6 || !col7) {
    return res.status(400).json({ 
      error: 'Faltan campos: col1, col2, col3, col4, col5, col6, col7' 
    });
  } 

    // Se insertan los valores de los votos en la BD
    try {
        const query1 = `
        INSERT INTO "public"."tae9374156b15a1563fb1239d45f8cd04d184f26f" (
            "a86ad94551a0e8edab1a357814cad829d0509b661",
            "a343726a05f3559abb9f3484cc3afbd992d06ddf0",
            "a0191b2477e7c3894201db6e50cac53bb69208f8c"
            ) VALUES ($1, $2, $3)
        `;
        const values1 = [col2, col3, col4];
        const result1 = await pool.query(query1, values1);

    // Se inserta el blockchain del votante y su trayetoria en la BD
        const query2 = `
        INSERT INTO "public"."t89344c9c1c66bb7d5691d88a4b7309499e0324be" (
            "a439145df693732a7d4567e33720a90124508ecdb",
            "a48a66962617bf51f46a9db9942af639056a5bc17",
            "a79b70b410141467f65c2100cdb656a5cd3b58f53",
            "ab99eb061f4f93aef0d9feaf32f7984afa9dd7c3b"
        ) VALUES ($1, $2, $3, $4)
        `;
        const values2 = [col1, col5, col6, col7];
        const result2 = await pool.query(query2, values2);
        
        res.status(201).json({ message: 'Voto registrado exitosamente' });
    } catch (error) {
        console.error('ERROR DETALLADO:', error); 
        return res.status(500).json({
            error: 'Error en la base de datos',
            detalle: error.message,
            codigo: error.code
        });
    }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});