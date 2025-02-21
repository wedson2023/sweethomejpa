const express = require('express');
const router = express.Router();

const reservas = require('../../controllers/app/reservas')
const anuncios = require('../../controllers/app/anuncios')

// middleware that is specific to this router
router.use((req, res, next) => {
    next()
})

router.get('/', (req, res) => {
    res.render('login', { layout: false });

});
router.get('/reservas', reservas.index);
router.get('/anuncios', anuncios.index);

module.exports = router