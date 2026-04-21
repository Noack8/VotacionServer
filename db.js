// db.js
import pkg from 'pg';
const { Pool } = pkg;

// Crea un pool de conexiones a nivel global.
// Esto permite que las conexiones se reutilicen entre funciones.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Usa el nombre de tu variable de entorno
  ssl: {
    rejectUnauthorized: false, // Necesario para muchas bases de datos en la nube
  },
});

export default pool;