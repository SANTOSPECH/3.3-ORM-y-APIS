import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const puerto = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// URI y nombre de base de datos desde el .env
const uri = process.env.uri;
const dbName = 'santos1234';

let db, usuariosCollection;

// Conectar a la base de datos
MongoClient.connect(uri)
  .then(cliente => {
    console.log("Conexión exitosa a la base de datos");
    db = cliente.db(dbName);
    usuariosCollection = db.collection('usuarios');
  })
  .catch(error => {
    console.error("Error al conectar a la base de datos:", error);
  });

// Rutas
app.get('/', (req, res) => {
  res.send('Bienvenido a mi API CRUD con el driver de MongoDB');
});

// Crear usuario
app.post('/usuarios', async (req, res) => {
  try {
    const resultado = await usuariosCollection.insertOne(req.body);
    res.status(201).json(resultado.ops?.[0] || req.body);
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
});

// Obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await usuariosCollection.find().toArray();
    res.status(200).json(usuarios);
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

// Obtener un usuario por ID
app.get('/usuarios/:id', async (req, res) => {
  try {
    const usuario = await usuariosCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(200).json(usuario);
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
});

// Actualizar usuario
app.put('/usuarios/:id', async (req, res) => {
  try {
    const resultado = await usuariosCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!resultado.value) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(200).json(resultado.value);
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
});

// Eliminar usuario
app.delete('/usuarios/:id', async (req, res) => {
  try {
    const resultado = await usuariosCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (resultado.deletedCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(200).json({ message: 'Usuario eliminado' });
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
});

// Iniciar servidor
app.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}`);
});
