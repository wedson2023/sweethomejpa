const express = require('express');
const router = express.Router();

const reservas = require('../../controllers/api/reservas')

// middleware that is specific to this router
router.use((req, res, next) => {
    next()
})

router.get('/reservas', reservas.index);
router.post('/reservas', reservas.store);
router.put('/reservas/:id', reservas.update);
router.delete('/reservas/:id', reservas.destroy);

module.exports = router