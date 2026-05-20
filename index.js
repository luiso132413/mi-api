// import express from 'express';

// const app = express();
// const port = 3000;

// app.use(express.json());

// //Ruta principal (get)
// app.use('/', (req, res)=>{
//     res.json({messege: 'Hola Mundo'});
// });

// //Arrancar el servidor
// app.listen(port, () => {
//     console.log(`Servidor escuchando en http://localhost:${port}`);
// });

import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Conexión a PostgreSQL
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
});

// GET - Obtener todos los estudiantes
app.get('/estudiantes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM estudiantes ORDER BY id_estudiante');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener un estudiante por ID
app.get('/estudiantes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM estudiantes WHERE id_estudiante = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear un estudiante
app.post('/estudiantes', async (req, res) => {
  try {
    const { nombre, apellido, grado, edad } = req.body;
    const result = await pool.query(
      'INSERT INTO estudiantes (nombre, apellido, grado, edad) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, apellido, grado, edad]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - Actualizar un estudiante
app.put('/estudiantes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, grado, edad } = req.body;
    const result = await pool.query(
      'UPDATE estudiantes SET nombre=$1, apellido=$2, grado=$3, edad=$4 WHERE id_estudiante=$5 RETURNING *',
      [nombre, apellido, grado, edad, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar un estudiante
app.delete('/estudiantes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM estudiantes WHERE id_estudiante=$1 RETURNING *', [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    res.json({ mensaje: 'Estudiante eliminado', estudiante: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Arrancar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});