const express = require('express');
const router = express.Router();

const reservas = require('../../controllers/api/reservas')
const anuncios = require('../../controllers/api/anuncios')
const despesas = require('../../controllers/api/despesas')

// middleware that is specific to this router
router.use((req, res, next) => {
    next()
})

router.get('/reservas', reservas.index);
router.post('/reservas', reservas.store);
router.put('/reservas/:id', reservas.update);
router.delete('/reservas/:id', reservas.destroy);
router.post('/situacao', reservas.situacao);

router.get('/anuncios', anuncios.index);
router.post('/anuncios', anuncios.store);
router.delete('/anuncios/:id', anuncios.destroy);

router.get('/despesas', despesas.index);
router.post('/despesas', despesas.store);
router.delete('/despesas/:id', despesas.destroy);

module.exports = router