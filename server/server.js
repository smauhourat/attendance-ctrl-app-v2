require('dotenv').config();
console.log(process.env.NODE_ENV);
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

// Crear servidor Express
const app = express();

// Conectar a MongoDB (configura esto en tu .env)
console.log('process.env.MONGODB_URI =>', process.env.MONGODB_URI)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Middlewares
app.use(cors())
// app.use(cors({
//     origin: 'http://localhost:5000'
// }));

app.use(express.json());
app.use(morgan('dev'));

// Rutas de la API
app.use('/api/events', require('./routes/events.routes'));
app.use('/api/attendances', require('./routes/attendances.routes'));

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

// En producción, servir los archivos estáticos de React
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
    });
}

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Error interno del servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor API corriendo en puerto ${PORT}`);
});