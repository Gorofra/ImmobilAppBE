const express = require('express');
const connection = require('../connection');
const router = express.Router();
const {checkIfAuthenticated} = require('../auth.middleware');


router.get("/", checkIfAuthenticated, ( req, res ) => { 
    const query =`SELECT id , data , indirizzo FROM ricevute ORDER BY id`
    
    connection.query(query, (err, results) =>{
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
    })
})

router.get('/:id',checkIfAuthenticated, (req, res) => {
    const query = `SELECT * FROM ricevute WHERE id = ?`;
    
    connection.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({
                error: "Errore nel recupero della ricevuta",
                details: err.message
            });
        }
        
        if (!results || results.length === 0) {
            return res.status(404).json({ message: "Ricevuta non trovata" });
        }
        
        return res.status(200).json(results[0]);
    });
});

// Create new ricevuta
router.post('/crea',checkIfAuthenticated, (req, res) => {
    const { data, indirizzo, importo, mese_riferimento, anno_riferimento } = req.body;
    const query = `INSERT INTO ricevute (data, indirizzo, importo, mese_riferimento, anno_riferimento) VALUES (?, ?, ?, ?, ?)`;
    
    connection.query(query, [data, indirizzo, importo, mese_riferimento, anno_riferimento], (err, result) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({
                error: "Errore nella creazione della ricevuta",
                details: err.message
            });
        }
        
        return res.status(201).json({
            message: "Ricevuta creata con successo",
            id: result.insertId
        });
    });
});

// Update ricevuta
router.put('/aggiorna/:id',checkIfAuthenticated, (req, res) => {
    const { data, indirizzo, importo, mese_riferimento, anno_riferimento } = req.body;
    const query = `UPDATE ricevute SET data = ?, indirizzo = ?, importo = ?, mese_riferimento = ?, anno_riferimento = ? WHERE id = ?`;
    
    connection.query(query, [data, indirizzo, importo, mese_riferimento, anno_riferimento, req.params.id], (err, result) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({
                error: "Errore nell'aggiornamento della ricevuta",
                details: err.message
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Ricevuta non trovata" });
        }
        
        return res.status(200).json({ message: "Ricevuta aggiornata con successo" });
    });
});

// Delete ricevuta
router.delete('/elimina/:id',checkIfAuthenticated, (req, res) => {
    const query = `DELETE FROM ricevute WHERE id = ?`;
    
    connection.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({
                error: "Errore nell'eliminazione della ricevuta",
                details: err.message
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Ricevuta non trovata" });
        }
        
        return res.status(200).json({ message: "Ricevuta eliminata con successo" });
    });
});

// Get ricevute by mese e anno
router.get('/periodo/:mese/:anno',checkIfAuthenticated, (req, res) => {
    const query = `SELECT * FROM ricevute WHERE mese_riferimento = ? AND anno_riferimento = ?`;
    
    connection.query(query, [req.params.mese, req.params.anno], (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({
                error: "Errore nel recupero delle ricevute",
                details: err.message
            });
        }
        
        return res.status(200).json(results);
    });
});

module.exports = router;