const express = require('express');
const connection = require('../connection');
const router = express.Router();

const {checkIfAuthenticated} = require('../auth.middleware');

router.get("/", checkIfAuthenticated, (req,res) =>{
    const query = `
        SELECT nome, via, affittuario, locatore,
        costo_affitto, costo_condominio, costo_bollo FROM immo
        ORDER BY via
    `;
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Full Database Error:', err);
            return res.status(500).json({
                error: "Errore nel recupero degli utenti",
                details: err.message,
                code: err.code,
                sqlMessage: err.sqlMessage
            });
        }

        if (!results) {
            return res.status(200).json([]);
        }

        return res.status(200).json(results);
    });
});

router.get('/:via', checkIfAuthenticated, (req, res) => {
    const query = `
        SELECT nome, via, affittuario, locatore,
        costo_affitto, costo_condominio, costo_bollo FROM immo
        WHERE via = ?
    `;

    connection.query(query, [req.params.via], (err, results) => {
        if (err) {
            console.error('Full Database Error:', err);
            return res.status(500).json({
                error: "Errore nel recupero dell'utente",
                details: err.message,
                code: err.code,
                sqlMessage: err.sqlMessage
            });
        }

        if (!results || results.length === 0) {
            return res.status(404).json({ message: "Utente non trovato" });
        }

        return res.status(200).json(results[0]);
    });
});


router.post('/registra', checkIfAuthenticated, (req, res) =>{
    const{nome, via, affittuario, locatore, costo_affitto, costo_condominio, costo_bollo} = req.body;
    const checkEmailQuery = 'SELECT * FROM immo WHERE via = ?';

    connection.query(checkEmailQuery, [via], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Errore durante la verifica della via", details: err });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: "Immobile gia registrato" });
        }
        const insertImmobiliQuery = "INSERT INTO immo (nome, via, affittuario, locatore, costo_affitto, costo_condominio, costo_bollo) VALUES (?, ?, ?, ?, ?, ?, ?)";
        connection.query(insertImmobiliQuery, [nome, via, affittuario, locatore, costo_affitto, costo_condominio, costo_bollo], (err, results) => {
            if (err) {
                return res.status(500).json({ error: "Errore durante la registrazione dell'immobile", details: err });
            }

            return res.status(201).json({ message: "Immobile registrato" });
        });
    });
});

router.put('/aggiorna/:via', checkIfAuthenticated, (req, res) =>{
    const {nome, via, affittuario, locatore, costo_affitto, costo_condominio, costo_bollo} = req.body;
    const query = 'UPDATE immo SET nome = ?, affittuario = ?, locatore = ?, costo_affitto = ?, costo_condominio = ?, costo_bollo = ? WHERE via = ?';
    connection.query(query, [ nome, via, affittuario, locatore, costo_condominio, costo_bollo] ,(err,res) =>{});
    if (err) {
        console.error('Full Database Error:', err);
        return res.status(500).json({
            error: "Errore durante l'aggiornamento dell'immobile",
            details: err.message,
            code: err.code,
            sqlMessage: err.sqlMessage
        });
    }
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Immobile non trovato" });
    }
    return res.status(200).json({ message: "Immobile aggiornato" });
});


router.delete('/elimina/:via', checkIfAuthenticated, (req, res) => {
    const query = 'DELETE FROM immo WHERE via = ?';
    connection.query(query, [req.params.via], (err, result) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({
                error: "Errore nell'eliminazione dell'immobile",
                details: err
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Immobile non trovato" });
        }
        return res.status(200).json({ message: "Immobile eliminato" });
    });
});


module.exports = router;