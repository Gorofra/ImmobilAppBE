const express = require('express');
var cors = require('cors');
const connection = require('./connection');
const immobiliRoute = require('./routes/immobili.route');
const ricevuteRoute = require('./routes/ricevute.route')


const app = express();

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use('/immobili',immobiliRoute);
app.use('/ricevute', ricevuteRoute)
app.use((err, req, res, next) => {
    console.error("Error:", err.stack);
    res.status(500).json({
        error: "Errore interno del server",
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;
